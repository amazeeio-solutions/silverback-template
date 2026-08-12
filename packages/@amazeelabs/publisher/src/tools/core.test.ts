import { expect, test, vi } from 'vitest';

import type {
  PublisherConfig,
  PublisherConfigGithubWorkflow,
  PublisherConfigLocal,
} from './config';

// The mode cores start queues and emit states on import, which is irrelevant
// for the mode selection.
vi.mock('../mode-github-workflow/core', () => ({
  core: { name: 'github-workflow-core' },
}));
vi.mock('../mode-local/core', () => ({ core: { name: 'local-core' } }));

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
 * The mode is resolved when the module is evaluated, so the configuration has
 * to be set on a freshly loaded module registry.
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
  const { core: localCore } = await import('../mode-local/core');

  expect(core).toBe(localCore);
});

test('the github workflow mode is served by the github workflow core', async () => {
  const { core } = await importCoreForConfig(githubWorkflowConfig);
  const { core: githubWorkflowCore } = await import(
    '../mode-github-workflow/core'
  );

  expect(core).toBe(githubWorkflowCore);
});

test('an unsupported mode is rejected', async () => {
  await expect(
    importCoreForConfig({
      ...localConfig,
      mode: 'ftp-upload',
    } as unknown as PublisherConfig),
  ).rejects.toThrow('Unsupported mode: ftp-upload');
});
