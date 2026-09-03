import { generateKeyPairSync } from 'node:crypto';

import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { PublisherConfigGithubWorkflow } from '../tools/config';

const githubWorkflowConfig: PublisherConfigGithubWorkflow = {
  mode: 'github-workflow',
  publisherPort: 3000,
  databaseUrl: ':memory:',
  publisherBaseUrl: 'https://build.example.com',
  workflow: 'build.yml',
  repo: 'AmazeeLabs/project',
  ref: 'dev',
  environment: 'dev-cb',
  workflowTimeout: 1000 * 60 * 30,
};

// GitHub hands out PKCS#1 keys, which the JWT library converts to the PKCS#8
// that WebCrypto needs.
const privateKeyPem = generateKeyPairSync('rsa', { modulusLength: 2048 })
  .privateKey.export({ type: 'pkcs1', format: 'pem' })
  .toString();
const privateKeyBase64 = Buffer.from(privateKeyPem).toString('base64');

type RecordedRequest = {
  url: string;
  method: string;
  body: Record<string, unknown>;
  authorization: string | undefined;
};

let requests: Array<RecordedRequest>;

type StubbedResponse = { status?: number; body?: unknown };

const stubFetch = (
  respond: (request: RecordedRequest) => StubbedResponse,
): void => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init: RequestInit) => {
      const headers = (init.headers ?? {}) as Record<string, string>;
      const request: RecordedRequest = {
        url: String(url),
        method: init.method ?? 'GET',
        body: init.body
          ? (JSON.parse(String(init.body)) as Record<string, unknown>)
          : {},
        authorization: headers['authorization'],
      };
      requests.push(request);
      const { status = 200, body } = respond(request);
      return new Response(body === undefined ? null : JSON.stringify(body), {
        status,
        headers: { 'content-type': 'application/json' },
      });
    }),
  );
};

// The module memoizes the resolved credentials, so every test gets a fresh
// module registry.
const load = async (
  configOverrides: Partial<PublisherConfigGithubWorkflow> = {},
): Promise<typeof import('./github')> => {
  vi.resetModules();
  const { setConfig } = await import('../tools/config');
  setConfig({ ...githubWorkflowConfig, ...configOverrides });
  return import('./github');
};

const useApp = (): void => {
  vi.stubEnv('GITHUB_APP_ID', '123');
  vi.stubEnv('GITHUB_APP_PRIVATE_KEY', privateKeyBase64);
  vi.stubEnv('GITHUB_APP_INSTALLATION_ID', '456');
};

const respondToAppRequests = (
  respond: (request: RecordedRequest) => StubbedResponse = () => ({
    status: 204,
  }),
): void => {
  stubFetch((request) => {
    if (request.url.includes('/access_tokens')) {
      return {
        status: 201,
        body: {
          token: 'installation-token',
          expires_at: new Date(Date.now() + 3600_000).toISOString(),
          permissions: { actions: 'write' },
        },
      };
    }
    return respond(request);
  });
};

beforeEach(() => {
  requests = [];
  vi.stubEnv('GH_TOKEN', undefined);
  vi.stubEnv('GITHUB_TOKEN', undefined);
  vi.stubEnv('GITHUB_APP_ID', undefined);
  vi.stubEnv('GITHUB_APP_PRIVATE_KEY', undefined);
  vi.stubEnv('GITHUB_APP_INSTALLATION_ID', undefined);
});

afterEach(async () => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  const { clearConfig } = await import('../tools/config');
  clearConfig();
});

test('GH_TOKEN is used for authentication', async () => {
  vi.stubEnv('GH_TOKEN', 'token-from-gh');
  const github = await load();
  stubFetch(() => ({ status: 204 }));

  expect(github.credentialsDescription()).toBe('GH_TOKEN');
  await github.dispatchWorkflow({});
  expect(requests[0]!.authorization).toBe('token token-from-gh');
});

test('GITHUB_TOKEN is used when GH_TOKEN is not set', async () => {
  vi.stubEnv('GITHUB_TOKEN', 'token-from-github');
  const github = await load();
  stubFetch(() => ({ status: 204 }));

  expect(github.credentialsDescription()).toBe('GITHUB_TOKEN');
  await github.dispatchWorkflow({});
  expect(requests[0]!.authorization).toBe('token token-from-github');
});

test('GH_TOKEN takes precedence over GITHUB_TOKEN', async () => {
  vi.stubEnv('GH_TOKEN', 'token-from-gh');
  vi.stubEnv('GITHUB_TOKEN', 'token-from-github');
  const github = await load();

  expect(github.credentialsDescription()).toBe('GH_TOKEN');
});

test('the app takes precedence over a token', async () => {
  useApp();
  vi.stubEnv('GH_TOKEN', 'token-from-gh');
  const github = await load();

  expect(github.credentialsDescription()).toBe(
    'GitHub App 123, installation 456',
  );
});

test('an installation token is minted and used for authentication', async () => {
  useApp();
  const github = await load();
  respondToAppRequests();

  await github.dispatchWorkflow({});

  const [jwtRequest, dispatchRequest] = requests;
  expect(jwtRequest!.url).toBe(
    'https://api.github.com/app/installations/456/access_tokens',
  );
  expect(jwtRequest!.authorization).toMatch(/^bearer /);
  expect(dispatchRequest!.authorization).toBe('token installation-token');
});

test('the installation token is scoped down to writing actions', async () => {
  useApp();
  const github = await load();
  respondToAppRequests();

  await github.dispatchWorkflow({});

  expect(requests[0]!.body).toStrictEqual({
    permissions: { actions: 'write' },
  });
});

test('the installation token is reused across requests', async () => {
  useApp();
  const github = await load();
  respondToAppRequests(() => ({
    status: 200,
    body: { workflow_runs: [] },
  }));

  await github.dispatchWorkflow({});
  await github.listWorkflowRuns();

  expect(
    requests.filter((request) => request.url.includes('/access_tokens')),
  ).toHaveLength(1);
});

test('incomplete app credentials name the missing variables', async () => {
  vi.stubEnv('GITHUB_APP_ID', '123');
  const github = await load();

  expect(() => github.credentialsDescription()).toThrowError(
    'Incomplete GitHub App credentials. Missing: GITHUB_APP_PRIVATE_KEY, GITHUB_APP_INSTALLATION_ID.',
  );
});

test('a private key that is not a base64 encoded PEM is rejected', async () => {
  useApp();
  vi.stubEnv('GITHUB_APP_PRIVATE_KEY', privateKeyPem);
  const github = await load();

  expect(() => github.credentialsDescription()).toThrowError(
    'GITHUB_APP_PRIVATE_KEY must be a base64 encoded PEM private key.',
  );
});

test('missing credentials are reported', async () => {
  const github = await load();

  expect(() => github.credentialsDescription()).toThrowError(
    'No GitHub credentials. Set GITHUB_APP_ID, GITHUB_APP_PRIVATE_KEY, GITHUB_APP_INSTALLATION_ID or GH_TOKEN / GITHUB_TOKEN.',
  );
});

test('the workflow is dispatched with the ref and the inputs', async () => {
  vi.stubEnv('GH_TOKEN', 'token');
  const github = await load();
  stubFetch(() => ({ status: 204 }));

  await github.dispatchWorkflow({ env: 'dev-cb' });

  expect(requests[0]!.method).toBe('POST');
  expect(requests[0]!.url).toBe(
    'https://api.github.com/repos/AmazeeLabs/project/actions/workflows/build.yml/dispatches',
  );
  expect(requests[0]!.body).toStrictEqual({
    ref: 'dev',
    inputs: { env: 'dev-cb' },
  });
});

test('the workflow runs are listed with their completion state', async () => {
  vi.stubEnv('GH_TOKEN', 'token');
  const github = await load();
  stubFetch(() => ({
    body: {
      workflow_runs: [
        { id: 1, name: 'Build [env: dev-cb]', conclusion: null },
        { id: 2, name: 'Build [env: dev-cb]', conclusion: 'success' },
      ],
    },
  }));

  await expect(github.listWorkflowRuns()).resolves.toStrictEqual([
    { id: 1, name: 'Build [env: dev-cb]', isCompleted: false },
    { id: 2, name: 'Build [env: dev-cb]', isCompleted: true },
  ]);
  expect(requests[0]!.url).toBe(
    'https://api.github.com/repos/AmazeeLabs/project/actions/workflows/build.yml/runs?per_page=100',
  );
});

test('a workflow run is cancelled by id', async () => {
  vi.stubEnv('GH_TOKEN', 'token');
  const github = await load();
  stubFetch(() => ({ status: 202, body: {} }));

  await github.cancelWorkflowRun(1);

  expect(requests[0]!.method).toBe('POST');
  expect(requests[0]!.url).toBe(
    'https://api.github.com/repos/AmazeeLabs/project/actions/runs/1/cancel',
  );
});

test('a repo that is not in the owner/repo format is rejected', async () => {
  vi.stubEnv('GH_TOKEN', 'token');
  const github = await load({ repo: 'project' });

  await expect(github.dispatchWorkflow({})).rejects.toThrowError(
    'Invalid repo "project". Expected the "owner/repo" format.',
  );
});

test('an api error is thrown with its status', async () => {
  vi.stubEnv('GH_TOKEN', 'token');
  const github = await load();
  stubFetch(() => ({
    status: 403,
    body: { message: 'Resource not accessible by integration' },
  }));

  await expect(github.dispatchWorkflow({})).rejects.toMatchObject({
    status: 403,
    message: expect.stringContaining('Resource not accessible by integration'),
  });
});
