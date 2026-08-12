import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { afterEach, expect, test, vi } from 'vitest';

import {
  clearConfig,
  getConfig,
  getConfigGithubWorkflow,
  getConfigLocal,
  PublisherConfig,
  PublisherConfigGithubWorkflow,
  PublisherConfigLocal,
  setConfig,
} from './config';

const localConfig: PublisherConfigLocal = {
  publisherPort: 3000,
  mode: 'local',
  commands: {
    clean: 'echo "clean"',
    build: { command: 'echo "build"' },
  },
  databaseUrl: ':memory:',
};

const githubWorkflowConfig: PublisherConfigGithubWorkflow = {
  publisherPort: 3000,
  mode: 'github-workflow',
  publisherBaseUrl: 'https://build.example.com',
  workflow: 'build.yml',
  repo: 'AmazeeLabs/project',
  ref: 'dev',
  environment: 'dev-cb',
  workflowTimeout: 1000,
  databaseUrl: ':memory:',
};

const slackEnvVarNames = [
  'PUBLISHER_SLACK_WEBHOOK',
  'PUBLISHER_SLACK_CHANNEL',
  'PUBLISHER_URL',
  'LAGOON_PROJECT',
  'LAGOON_ENVIRONMENT',
] as const;

const originalEnv = Object.fromEntries(
  slackEnvVarNames.map((name) => [name, process.env[name]]),
);

const restoreEnv = (): void => {
  for (const name of slackEnvVarNames) {
    const value = originalEnv[name];
    if (value === undefined) {
      delete process.env[name];
    } else {
      process.env[name] = value;
    }
  }
};

const originalCwd = process.cwd();
const temporaryDirectories: Array<string> = [];

// getConfig() resolves the config relative to process.cwd(), so these tests
// chdir into a temporary directory. That requires vitest's "forks" pool, which
// vitest.config.ts pins explicitly - process.chdir() is a no-op in workers.
const chdirToConfigDirectory = (configSource?: string): string => {
  const directory = mkdtempSync(join(tmpdir(), 'publisher-config-'));
  temporaryDirectories.push(directory);
  if (configSource) {
    writeFileSync(join(directory, 'publisher.config.ts'), configSource);
  }
  process.chdir(directory);
  // On macOS the temp directory is a symlink, so process.cwd() is the resolved
  // path, which is what the config lookup will report.
  return process.cwd();
};

afterEach(() => {
  clearConfig();
  restoreEnv();
  process.chdir(originalCwd);
  vi.restoreAllMocks();
  while (temporaryDirectories.length) {
    rmSync(temporaryDirectories.pop()!, { recursive: true, force: true });
  }
});

// The config file is compiled by ts-import, so it must not import anything from
// the package itself - internal imports break the ts-import process.
const realTypescriptConfigSource = `
type Mode = 'local' | 'github-workflow';

interface TestPublisherConfig {
  publisherPort: number;
  mode: Mode;
  databaseUrl: string;
  commands: {
    clean: string;
    build: { command: string; outputTimeout?: number };
  };
}

const defineConfig = (config: TestPublisherConfig): TestPublisherConfig =>
  config;

export default defineConfig({
  publisherPort: 4242,
  mode: 'local',
  databaseUrl: './test/database.sqlite',
  commands: {
    clean: 'echo "clean"',
    build: { command: 'echo "build"', outputTimeout: 5000 },
  },
});
`;

test('getConfig compiles and loads a real TypeScript config from the cwd', () => {
  chdirToConfigDirectory(realTypescriptConfigSource);

  const config = getConfig();

  expect(config.mode).toBe('local');
  expect(config.publisherPort).toBe(4242);
  expect(config.databaseUrl).toBe('./test/database.sqlite');
  expect(getConfigLocal().commands).toStrictEqual({
    clean: 'echo "clean"',
    build: { command: 'echo "build"', outputTimeout: 5000 },
  });
});

test('getConfig caches the loaded config', () => {
  chdirToConfigDirectory(realTypescriptConfigSource);

  expect(getConfig()).toBe(getConfig());
});

test('getConfig reports a missing config file and exits', () => {
  const directory = chdirToConfigDirectory();
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  const exit = vi
    .spyOn(process, 'exit')
    .mockImplementation(() => undefined as never);

  // The spy prevents the actual exit, so execution continues into ts-import
  // and fails on the missing file.
  expect(() => getConfig()).toThrow();

  expect(exit).toHaveBeenCalledWith(1);
  expect(consoleError).toHaveBeenCalledWith(
    `Publisher config not found: ${join(directory, 'publisher.config.ts')}`,
  );
});

test('getConfigLocal returns the config in local mode', () => {
  setConfig(localConfig);
  expect(getConfigLocal()).toBe(localConfig);
});

test('getConfigLocal throws in github-workflow mode', () => {
  setConfig(githubWorkflowConfig);
  expect(() => getConfigLocal()).toThrow('Config is not "local"');
});

test('getConfigGithubWorkflow returns the config in github-workflow mode', () => {
  setConfig(githubWorkflowConfig);
  expect(getConfigGithubWorkflow()).toBe(githubWorkflowConfig);
});

test('getConfigGithubWorkflow throws in local mode', () => {
  setConfig(localConfig);
  expect(() => getConfigGithubWorkflow()).toThrow(
    'Config is not "github-workflow"',
  );
});

test('setConfig fills slack notifications from environment variables', () => {
  process.env.PUBLISHER_SLACK_WEBHOOK =
    'https://hooks.slack.com/services/T/B/X';
  process.env.PUBLISHER_SLACK_CHANNEL = '#general';
  process.env.PUBLISHER_URL = 'https://build.example.com';
  process.env.LAGOON_PROJECT = 'project';
  process.env.LAGOON_ENVIRONMENT = 'dev-cb';

  setConfig({ ...localConfig });

  expect(getConfig().slackNotifications).toStrictEqual({
    webhookUrl: 'https://hooks.slack.com/services/T/B/X',
    channel: '#general',
    publisherBaseUrl: 'https://build.example.com',
    projectName: 'project',
    environmentName: 'dev-cb',
  });
});

test('setConfig leaves optional slack fields undefined when their environment variables are missing', () => {
  process.env.PUBLISHER_SLACK_WEBHOOK =
    'https://hooks.slack.com/services/T/B/X';
  process.env.PUBLISHER_SLACK_CHANNEL = '#general';
  delete process.env.PUBLISHER_URL;
  delete process.env.LAGOON_PROJECT;
  delete process.env.LAGOON_ENVIRONMENT;

  setConfig({ ...localConfig });

  expect(getConfig().slackNotifications).toStrictEqual({
    webhookUrl: 'https://hooks.slack.com/services/T/B/X',
    channel: '#general',
    publisherBaseUrl: undefined,
    projectName: undefined,
    environmentName: undefined,
  });
});

test('setConfig does not fill slack notifications without both webhook and channel', () => {
  process.env.PUBLISHER_SLACK_WEBHOOK =
    'https://hooks.slack.com/services/T/B/X';
  delete process.env.PUBLISHER_SLACK_CHANNEL;

  setConfig({ ...localConfig });

  expect(getConfig().slackNotifications).toBeUndefined();
});

test('setConfig does not overwrite explicit slack notifications', () => {
  process.env.PUBLISHER_SLACK_WEBHOOK = 'https://hooks.slack.com/services/env';
  process.env.PUBLISHER_SLACK_CHANNEL = '#from-env';

  const explicit: PublisherConfig = {
    ...localConfig,
    slackNotifications: {
      webhookUrl: 'https://hooks.slack.com/services/explicit',
      channel: '#explicit',
    },
  };
  setConfig(explicit);

  expect(getConfig().slackNotifications).toStrictEqual({
    webhookUrl: 'https://hooks.slack.com/services/explicit',
    channel: '#explicit',
  });
});

test('clearConfig resets the cached config', () => {
  chdirToConfigDirectory(realTypescriptConfigSource);
  setConfig(localConfig);
  expect(getConfig()).toBe(localConfig);

  clearConfig();

  expect(getConfig()).not.toBe(localConfig);
  expect(getConfig().publisherPort).toBe(4242);
});
