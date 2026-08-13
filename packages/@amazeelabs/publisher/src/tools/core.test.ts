import { expect, test, vi } from 'vitest';

import type {
  PublisherConfig,
  PublisherConfigGithubWorkflow,
  PublisherConfigLocal,
} from './config';

// The mode cores start queues and emit states on import, which is irrelevant
// for the mode selection.
vi.mock('../mode-github-workflow/core', () => ({
  core: { getBuildNumber: () => 'github-workflow-core' },
}));
vi.mock('../mode-local/core', () => ({
  core: { getBuildNumber: () => 'local-core' },
}));

const localConfig: PublisherConfigLocal = {
  mode: 'local',
  publisherPort: 3000,
  databaseUrl: ':memory:',
  commands: {
    clean: 'echo "clean"',
    build: { command: 'echo "build"' },
  },
};

const githubWorkflowConfig: PublisherConfigGithubWorkflow = {
  mode: 'github-workflow',
  publisherPort: 3000,
  databaseUrl: ':memory:',
  publisherBaseUrl: 'https://build.example.com',
  workflow: 'build.yml',
  repo: 'AmazeeLabs/project',
  ref: 'dev',
  environment: 'dev',
  workflowTimeout: 1000,
};

/**
 * The core resolves the mode on first use and then keeps it, so every case
 * needs a freshly loaded module registry.
 */
const importCoreForConfig = async (
  config: PublisherConfig,
): Promise<typeof import('./core')> => {
  vi.resetModules();
  const { setConfig } = await import('./config');
  setConfig(config);
  return import('./core');
};

test('the local mode is served by the local core', async () => {
  const { core } = await importCoreForConfig(localConfig);

  expect(core.getBuildNumber()).toBe('local-core');
});

test('the github workflow mode is served by the github workflow core', async () => {
  const { core } = await importCoreForConfig(githubWorkflowConfig);

  expect(core.getBuildNumber()).toBe('github-workflow-core');
});

test('an unsupported mode is rejected', async () => {
  const { core } = await importCoreForConfig({
    ...localConfig,
    mode: 'ftp-upload',
  } as unknown as PublisherConfig);

  expect(() => core.getBuildNumber()).toThrow('Unsupported mode: ftp-upload');
});

test('the core is not resolved before it is used', async () => {
  vi.resetModules();
  const { clearConfig } = await import('./config');
  clearConfig();

  // Importing must not read the config, otherwise the cli cannot import the
  // core before loading the config.
  await expect(import('./core')).resolves.toBeDefined();
});
