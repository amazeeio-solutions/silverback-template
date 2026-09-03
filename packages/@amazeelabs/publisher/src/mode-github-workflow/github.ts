import { createAppAuth } from '@octokit/auth-app';
import { Octokit } from '@octokit/core';

import { getConfigGithubWorkflow as config } from '../tools/config';

export type WorkflowRun = {
  id: number;
  name: string;
  isCompleted: boolean;
};

const appVariableNames = [
  'GITHUB_APP_ID',
  'GITHUB_APP_PRIVATE_KEY',
  'GITHUB_APP_INSTALLATION_ID',
] as const;

type Credentials = {
  description: string;
  getToken: () => Promise<string>;
};

let credentials: Credentials | null = null;

const decodePrivateKey = (value: string): string => {
  const key = Buffer.from(value, 'base64').toString('utf-8');
  if (!key.includes('-----BEGIN')) {
    throw new Error(
      'GITHUB_APP_PRIVATE_KEY must be a base64 encoded PEM private key.',
    );
  }
  return key;
};

const appCredentials = (): Credentials => {
  const missing = appVariableNames.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(
      `Incomplete GitHub App credentials. Missing: ${missing.join(', ')}.`,
    );
  }
  const appId = process.env.GITHUB_APP_ID!;
  const installationId = process.env.GITHUB_APP_INSTALLATION_ID!;
  const auth = createAppAuth({
    appId,
    privateKey: decodePrivateKey(process.env.GITHUB_APP_PRIVATE_KEY!),
    installationId,
  });
  return {
    description: `GitHub App ${appId}, installation ${installationId}`,
    getToken: async () => {
      // The installation may grant more than Publisher needs, as the app can be
      // shared with other automations, so the token is scoped down to what
      // dispatching and cancelling workflow runs requires. Tokens are cached
      // and renewed by auth-app.
      const authentication = await auth({
        type: 'installation',
        permissions: { actions: 'write' },
      });
      return authentication.token;
    },
  };
};

const tokenCredentials = (): Credentials | null => {
  // Mirrors the precedence the github-cli used before it was replaced.
  const name = process.env.GH_TOKEN ? 'GH_TOKEN' : 'GITHUB_TOKEN';
  const token = process.env[name];
  if (!token) {
    return null;
  }
  return { description: name, getToken: async () => token };
};

const resolveCredentials = (): Credentials => {
  // Any app variable is taken as the intent to use the app, so an incomplete
  // set fails instead of silently falling back to a personal access token.
  if (appVariableNames.some((name) => process.env[name])) {
    return appCredentials();
  }
  const fromToken = tokenCredentials();
  if (fromToken) {
    return fromToken;
  }
  throw new Error(
    `No GitHub credentials. Set ${appVariableNames.join(', ')} or GH_TOKEN / GITHUB_TOKEN.`,
  );
};

const getCredentials = (): Credentials => {
  credentials ??= resolveCredentials();
  return credentials;
};

export const credentialsDescription = (): string =>
  getCredentials().description;

const authenticatedOctokit = async (): Promise<Octokit> =>
  new Octokit({ auth: await getCredentials().getToken() });

const repository = (): { owner: string; repo: string } => {
  const [owner, repo, ...rest] = config().repo.split('/');
  if (!owner || !repo || rest.length > 0) {
    throw new Error(
      `Invalid repo "${config().repo}". Expected the "owner/repo" format.`,
    );
  }
  return { owner, repo };
};

export const dispatchWorkflow = async (
  inputs: Record<string, string>,
): Promise<void> => {
  const octokit = await authenticatedOctokit();
  await octokit.request(
    'POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches',
    {
      ...repository(),
      workflow_id: config().workflow,
      ref: config().ref,
      inputs,
    },
  );
};

export const listWorkflowRuns = async (): Promise<Array<WorkflowRun>> => {
  const octokit = await authenticatedOctokit();
  const { data } = await octokit.request(
    'GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs',
    {
      ...repository(),
      workflow_id: config().workflow,
      per_page: 100,
    },
  );
  return data.workflow_runs.map((run) => ({
    // The API types widen run ids to bigint, while the cancel endpoint they are
    // passed to only accepts a number.
    id: Number(run.id),
    name: run.name ?? '',
    isCompleted: !!run.conclusion,
  }));
};

export const cancelWorkflowRun = async (id: number): Promise<void> => {
  const octokit = await authenticatedOctokit();
  await octokit.request(
    'POST /repos/{owner}/{repo}/actions/runs/{run_id}/cancel',
    {
      ...repository(),
      run_id: id,
    },
  );
};
