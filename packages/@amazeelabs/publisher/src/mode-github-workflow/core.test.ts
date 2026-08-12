import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { PublisherConfigGithubWorkflow } from '../tools/config';
import { TaskController, TaskJob } from '../tools/queue';

const { buildJob, buildTask, cancelWorkflowTask } = vi.hoisted(() => {
  const buildJob = vi.fn<TaskJob>(async () => true);
  return {
    buildJob,
    buildTask: vi.fn(() => buildJob),
    cancelWorkflowTask: vi.fn<TaskJob>(async () => true),
  };
});

vi.mock('./tasks', () => ({ buildTask, cancelWorkflowTask }));

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

// `./core` keeps module level state, so every test gets a fresh module
// registry with the configuration set upfront.
const load = async (
  configOverrides: Partial<PublisherConfigGithubWorkflow> = {},
): Promise<typeof import('./core').core> => {
  vi.resetModules();
  const { setConfig } = await import('../tools/config');
  setConfig({ ...githubWorkflowConfig, ...configOverrides });
  return (await import('./core')).core;
};

const hangUntilCancelled: TaskJob = (controller: TaskController) =>
  new Promise<boolean>((resolve) => {
    controller.onCancel(() => resolve(false));
  });

beforeEach(() => {
  buildJob.mockClear();
  buildTask.mockClear();
  cancelWorkflowTask.mockClear();
  cancelWorkflowTask.mockImplementation(async () => true);
});

afterEach(async () => {
  const { clearConfig } = await import('../tools/config');
  clearConfig();
});

test('start() cancels running workflows', async () => {
  const core = await load();
  core.start();
  await core.queue.whenIdle;

  expect(cancelWorkflowTask).toHaveBeenCalledTimes(1);
  expect(buildTask).not.toHaveBeenCalled();
});

test('start() does not build when cleanBuildOnStart is disabled', async () => {
  const core = await load({ cleanBuildOnStart: false });
  core.start();
  await core.queue.whenIdle;

  expect(cancelWorkflowTask).toHaveBeenCalledTimes(1);
  expect(buildTask).not.toHaveBeenCalled();
});

test('start() queues a clean build when cleanBuildOnStart is enabled', async () => {
  const core = await load({ cleanBuildOnStart: true });
  core.start();
  await core.queue.whenIdle;

  expect(cancelWorkflowTask).toHaveBeenCalledTimes(1);
  expect(buildTask).toHaveBeenCalledTimes(1);
  expect(buildTask).toHaveBeenCalledWith({ clean: true });
  expect(buildJob).toHaveBeenCalledTimes(1);
});

test('multiple build() calls do queue a single build', async () => {
  const core = await load();
  core.start();
  core.build();
  core.build();
  core.build();
  await core.queue.whenIdle;

  expect(buildTask).toHaveBeenCalledTimes(1);
  expect(buildTask).toHaveBeenCalledWith();
  expect(buildJob).toHaveBeenCalledTimes(1);
});

test('build() queues a new build once the queue is idle', async () => {
  const core = await load();
  core.start();
  await core.queue.whenIdle;
  core.build();
  await core.queue.whenIdle;
  core.build();
  await core.queue.whenIdle;

  expect(buildJob).toHaveBeenCalledTimes(2);
});

test('clean() drops queued tasks, resets the build number and builds clean', async () => {
  const core = await load({ cleanBuildOnStart: true });
  cancelWorkflowTask.mockImplementationOnce(hangUntilCancelled);
  core.start();
  core.state.buildNumber = 4;

  await core.clean();

  expect(core.getBuildNumber()).toBe(0);
  expect(buildTask).toHaveBeenLastCalledWith({ clean: true });
  // The build queued by start() has been dropped.
  expect(buildJob).not.toHaveBeenCalled();

  await core.queue.whenIdle;
  expect(buildJob).toHaveBeenCalledTimes(1);
});

test('stop() drops queued tasks and cancels the running one', async () => {
  const core = await load({ cleanBuildOnStart: true });
  cancelWorkflowTask.mockImplementationOnce(hangUntilCancelled);
  core.start();
  expect(core.queue.hasPendingTasks()).toBe(true);
  expect(core.queue.hasActiveTasks()).toBe(true);

  await core.stop();
  await core.queue.whenIdle;

  expect(core.queue.hasPendingTasks()).toBe(false);
  expect(core.queue.hasActiveTasks()).toBe(false);
  expect(buildJob).not.toHaveBeenCalled();
});

test('getBuildNumber() reports the current build number', async () => {
  const core = await load();
  expect(core.getBuildNumber()).toBe(0);

  core.state.buildNumber = 7;
  expect(core.getBuildNumber()).toBe(7);
});
