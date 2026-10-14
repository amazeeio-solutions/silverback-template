import { inspect } from 'node:util';

import { afterEach, beforeEach, expect, MockInstance, test, vi } from 'vitest';

import { ApplicationState, WorkflowPublisherPayload } from '../shared/exports';
import { PublisherConfigGithubWorkflow } from '../tools/config';
import { TaskController } from '../tools/queue';

const {
  cancelWorkflowRun,
  dispatchWorkflow,
  listWorkflowRuns,
  saveBuildInfoSafely,
} = vi.hoisted(() => ({
  cancelWorkflowRun: vi.fn(),
  dispatchWorkflow: vi.fn(),
  listWorkflowRuns: vi.fn(),
  saveBuildInfoSafely: vi.fn(),
}));

vi.mock('./github', () => ({
  cancelWorkflowRun,
  dispatchWorkflow,
  listWorkflowRuns,
}));
vi.mock('../tools/database', () => ({ saveBuildInfoSafely }));

const githubWorkflowConfig: PublisherConfigGithubWorkflow = {
  mode: 'github-workflow',
  publisherPort: 3000,
  databaseUrl: ':memory:',
  publisherBaseUrl: 'https://build.example.com',
  workflow: 'build.yml',
  repo: 'AmazeeLabs/project',
  ref: 'dev',
  environment: 'dev-cb',
  environmentVariables: { DRUPAL_URL: 'https://dev-cb.cms.example.com' },
  inputs: { env: 'dev-cb' },
  workflowTimeout: 1000 * 60 * 30,
};

type Loaded = {
  core: typeof import('./core').core;
  buildTask: typeof import('./tasks').buildTask;
  cancelWorkflowTask: typeof import('./tasks').cancelWorkflowTask;
  output: Array<string>;
  states: Array<ApplicationState>;
};

// `./core` keeps module level state (build number, workflow state), so every
// test gets a fresh module registry with the configuration set upfront.
const load = async (
  configOverrides: Partial<PublisherConfigGithubWorkflow> = {},
): Promise<Loaded> => {
  vi.resetModules();
  const { setConfig } = await import('../tools/config');
  setConfig({ ...githubWorkflowConfig, ...configOverrides });
  const { core } = await import('./core');
  const { buildTask, cancelWorkflowTask } = await import('./tasks');
  const output: Array<string> = [];
  core.output$.subscribe((chunk) => {
    output.push(chunk);
  });
  const states: Array<ApplicationState> = [];
  core.state.applicationState$.subscribe((state) => {
    states.push(state);
  });
  return { core, buildTask, cancelWorkflowTask, output, states };
};

const flush = async (): Promise<void> => {
  await new Promise((resolve) => setImmediate(resolve));
};

const failAttempt = async (core: Loaded['core']): Promise<void> => {
  core.state.workflowState$.next('failure');
  await flush();
};

const workflowRunInputs = (call: number): Record<string, string> => {
  return dispatchWorkflow.mock.calls[call]![0] as Record<string, string>;
};

const workflowRunPayload = (call: number): WorkflowPublisherPayload => {
  return JSON.parse(
    workflowRunInputs(call).publisher_payload!,
  ) as WorkflowPublisherPayload;
};

const requestError = Object.assign(
  new Error('Resource not accessible by integration'),
  { status: 403 },
);

const runningRun = { id: 1, name: 'Build [env: dev-cb]', isCompleted: false };
const cancelledRun = { id: 1, name: 'Build [env: dev-cb]', isCompleted: true };

let consoleError: MockInstance;

beforeEach(() => {
  consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  dispatchWorkflow.mockReset();
  dispatchWorkflow.mockResolvedValue(undefined);
  cancelWorkflowRun.mockReset();
  cancelWorkflowRun.mockResolvedValue(undefined);
  listWorkflowRuns.mockReset();
  listWorkflowRuns.mockResolvedValue([]);
  saveBuildInfoSafely.mockReset();
});

afterEach(async () => {
  consoleError.mockRestore();
  vi.useRealTimers();
  const { clearConfig } = await import('../tools/config');
  clearConfig();
});

test('a successful first build reports Starting and Ready', async () => {
  const { core, buildTask, output, states } = await load();
  const result = buildTask()(new TaskController());

  expect(states).toStrictEqual([ApplicationState.Starting]);
  expect(core.state.buildNumber).toBe(1);

  core.state.workflowState$.next('success');

  await expect(result).resolves.toBe(true);
  expect(states).toStrictEqual([
    ApplicationState.Starting,
    ApplicationState.Ready,
  ]);
  expect(output).toStrictEqual([
    'ℹ️ Starting the workflow\n',
    '✅ Workflow succeeded\n',
    'Logs: \n',
  ]);
  expect(saveBuildInfoSafely).toHaveBeenCalledTimes(1);
  expect(saveBuildInfoSafely).toHaveBeenCalledWith(
    expect.objectContaining({ type: 'github-workflow', success: true }),
  );
  const { logs, startedAt, finishedAt } = saveBuildInfoSafely.mock.calls[0]![0];
  expect(logs).toContain('Starting the workflow');
  expect(logs).toContain('Workflow succeeded');
  expect(finishedAt).toBeGreaterThanOrEqual(startedAt);
});

test('a build after the first one reports Updating', async () => {
  const { core, buildTask, states } = await load();
  const firstBuild = buildTask()(new TaskController());
  core.state.workflowState$.next('success');
  await firstBuild;

  const secondBuild = buildTask()(new TaskController());
  expect(core.state.buildNumber).toBe(2);
  core.state.workflowState$.next('success');
  await expect(secondBuild).resolves.toBe(true);

  expect(states).toStrictEqual([
    ApplicationState.Starting,
    ApplicationState.Ready,
    ApplicationState.Updating,
    ApplicationState.Ready,
  ]);
});

test('the first build gets three attempts and cleans on the second one', async () => {
  const { core, buildTask, output, states } = await load();
  const result = buildTask({ clean: false })(new TaskController());

  await failAttempt(core);
  await failAttempt(core);
  await failAttempt(core);

  await expect(result).resolves.toBe(false);
  expect(dispatchWorkflow).toHaveBeenCalledTimes(3);
  expect(workflowRunPayload(0).clearCache).toBe(false);
  expect(workflowRunPayload(1).clearCache).toBe(true);
  expect(workflowRunPayload(2).clearCache).toBe(false);
  expect(output).toStrictEqual([
    'ℹ️ Starting the workflow\n',
    '❌ Workflow failed or cancelled\n',
    'Logs: \n',
    'ℹ️ Starting the workflow (clean build 🧹)\n',
    '❌ Workflow failed or cancelled\n',
    'Logs: \n',
    'ℹ️ Starting the workflow\n',
    '❌ Workflow failed or cancelled\n',
    'Logs: \n',
  ]);
  expect(states).toStrictEqual([
    ApplicationState.Starting,
    ApplicationState.Error,
  ]);
  expect(saveBuildInfoSafely).toHaveBeenCalledWith(
    expect.objectContaining({ type: 'github-workflow', success: false }),
  );
});

test('a clean argument is passed to all attempts of the first build', async () => {
  const { core, buildTask } = await load();
  const result = buildTask({ clean: true })(new TaskController());

  await failAttempt(core);
  await failAttempt(core);
  await failAttempt(core);

  await expect(result).resolves.toBe(false);
  expect(workflowRunPayload(0).clearCache).toBe(true);
  expect(workflowRunPayload(1).clearCache).toBe(true);
  expect(workflowRunPayload(2).clearCache).toBe(true);
});

test('builds after the first one get a single attempt', async () => {
  const { core, buildTask, states } = await load();
  const firstBuild = buildTask()(new TaskController());
  core.state.workflowState$.next('success');
  await firstBuild;

  const secondBuild = buildTask()(new TaskController());
  core.state.workflowState$.next('failure');

  await expect(secondBuild).resolves.toBe(false);
  expect(dispatchWorkflow).toHaveBeenCalledTimes(2);
  expect(states).toStrictEqual([
    ApplicationState.Starting,
    ApplicationState.Ready,
    ApplicationState.Updating,
    ApplicationState.Error,
  ]);
});

test('cancelling the first build does not start the remaining attempts', async () => {
  const { buildTask, output } = await load();

  vi.useFakeTimers();
  const controller = new TaskController();
  const build = buildTask()(controller);
  controller.cancel();
  // The cancellation waits for the runs to stop.
  await vi.advanceTimersByTimeAsync(10_000);

  expect(
    output.filter((chunk) => chunk.includes('Starting the workflow')),
  ).toHaveLength(1);
  await expect(build).resolves.toBe(false);
});

test('a cancellation only cancels the current attempt', async () => {
  const { core, buildTask, output } = await load();
  const controller = new TaskController();
  const build = buildTask()(controller);
  await failAttempt(core);
  await failAttempt(core);

  vi.useFakeTimers();
  controller.cancel();
  await vi.advanceTimersByTimeAsync(10_000);

  await expect(build).resolves.toBe(false);
  expect(
    output.filter((chunk) => chunk.includes('Cancelling the workflow')),
  ).toHaveLength(1);
});

test('a cancelled build is not reported as an error', async () => {
  const { core, buildTask, states } = await load();
  const firstBuild = buildTask()(new TaskController());
  core.state.workflowState$.next('success');
  await firstBuild;

  vi.useFakeTimers();
  const controller = new TaskController();
  const secondBuild = buildTask()(controller);
  controller.cancel();
  await vi.advanceTimersByTimeAsync(10_000);

  await expect(secondBuild).resolves.toBe(false);
  expect(states).toStrictEqual([
    ApplicationState.Starting,
    ApplicationState.Ready,
    ApplicationState.Updating,
  ]);
  expect(saveBuildInfoSafely).toHaveBeenCalledTimes(2);
  expect(saveBuildInfoSafely).toHaveBeenLastCalledWith(
    expect.objectContaining({ success: false }),
  );
});

test('the workflow state of a previous build is ignored', async () => {
  const { core, buildTask } = await load();
  const firstBuild = buildTask()(new TaskController());
  core.state.workflowState$.next('success');
  await firstBuild;

  // The workflow state subject still holds the "success" of the first build.
  const secondBuild = buildTask()(new TaskController());
  const settled = vi.fn();
  void secondBuild.then(settled);
  await flush();
  expect(settled).not.toHaveBeenCalled();

  core.state.workflowState$.next('failure');
  await expect(secondBuild).resolves.toBe(false);
});

test('the workflow run inputs are built from the config', async () => {
  const { core, buildTask } = await load();
  const result = buildTask({ clean: true })(new TaskController());

  expect(dispatchWorkflow).toHaveBeenCalledTimes(1);
  expect(workflowRunInputs(0).env).toBe('dev-cb');
  expect(workflowRunPayload(0)).toStrictEqual({
    callbackUrl: 'https://build.example.com/github-workflow-status',
    clearCache: true,
    environmentVariables: { DRUPAL_URL: 'https://dev-cb.cms.example.com' },
  });

  core.state.workflowState$.next('success');
  await result;
});

test('a started workflow logs the run url and does not finish the build', async () => {
  const { core, buildTask, output } = await load();
  core.state.workflowRunUrl =
    'https://github.com/AmazeeLabs/project/actions/runs/1';
  const result = buildTask()(new TaskController());

  core.state.workflowState$.next('started');
  await flush();
  expect(dispatchWorkflow).toHaveBeenCalledTimes(1);
  expect(output).toStrictEqual([
    'ℹ️ Starting the workflow\n',
    'ℹ️ Workflow started\n',
    'Logs: https://github.com/AmazeeLabs/project/actions/runs/1\n',
  ]);

  core.state.workflowState$.next('success');
  await expect(result).resolves.toBe(true);
  expect(output).toContain('✅ Workflow succeeded\n');
});

test('the output subscription is removed when the build is finished', async () => {
  const { core, buildTask } = await load();
  const observersBeforeBuild = core.output$.observers.length;

  const result = buildTask()(new TaskController());
  expect(core.output$.observers.length).toBe(observersBeforeBuild + 1);

  core.state.workflowState$.next('success');
  await result;
  expect(core.output$.observers.length).toBe(observersBeforeBuild);
});

test('a failing dispatch fails the build attempt and logs the error', async () => {
  const { core, buildTask, output } = await load();
  const firstBuild = buildTask()(new TaskController());
  core.state.workflowState$.next('success');
  await firstBuild;

  dispatchWorkflow.mockRejectedValue(requestError);
  await expect(buildTask()(new TaskController())).resolves.toBe(false);

  expect(output).toContain('❌ Error starting the workflow\n');
  expect(output).toContain('Error: Resource not accessible by integration\n');
  expect(output).toContain('Status: 403\n');
  expect(consoleError).toHaveBeenCalledWith(
    'Resource not accessible by integration (status 403)',
  );
});

test('the request of a failing dispatch is kept out of the logs', async () => {
  const { core, buildTask, output } = await load();
  const firstBuild = buildTask()(new TaskController());
  core.state.workflowState$.next('success');
  await firstBuild;

  // The api errors carry the request they were made with, and the dispatch body
  // holds the environment variables of the build.
  dispatchWorkflow.mockRejectedValue(
    Object.assign(new Error('Validation failed'), {
      status: 422,
      request: {
        body: JSON.stringify({
          inputs: { NETLIFY_AUTH_TOKEN: 'a-secret' },
        }),
      },
    }),
  );
  await expect(buildTask()(new TaskController())).resolves.toBe(false);

  expect(
    consoleError.mock.calls
      .flat()
      .map((argument) => inspect(argument, { depth: 10 }))
      .join('\n'),
  ).not.toContain('a-secret');
  expect(output.join('\n')).not.toContain('a-secret');
  expect(consoleError).toHaveBeenCalledWith('Validation failed (status 422)');
});

test('missing credentials fail the build attempt and are logged', async () => {
  const { buildTask, output } = await load();
  dispatchWorkflow.mockRejectedValue(new Error('No GitHub credentials.'));

  await expect(buildTask()(new TaskController())).resolves.toBe(false);

  expect(output).toContain('❌ Error starting the workflow\n');
  expect(output).toContain('Error: No GitHub credentials.\n');
});

test('reaching the workflow timeout cancels the workflow and fails the build', async () => {
  const { core, buildTask, output } = await load({ workflowTimeout: 5000 });
  const firstBuild = buildTask()(new TaskController());
  core.state.workflowState$.next('success');
  await firstBuild;

  vi.useFakeTimers();
  const secondBuild = buildTask()(new TaskController());
  await vi.advanceTimersByTimeAsync(5000);
  // The cancellation waits for the runs to stop.
  await vi.advanceTimersByTimeAsync(10_000);

  await expect(secondBuild).resolves.toBe(false);
  expect(output).toContain('❌ Timeout reached\n');
  expect(output).toContain('⚠️ Cancelling the workflow\n');
  expect(listWorkflowRuns).toHaveBeenCalled();
});

test('only uncompleted runs of the environment are cancelled', async () => {
  const { cancelWorkflowTask } = await load();
  listWorkflowRuns
    .mockResolvedValueOnce([
      runningRun,
      { id: 2, name: 'Build [env: dev-cb]', isCompleted: true },
      { id: 3, name: 'Build [env: other]', isCompleted: false },
    ])
    .mockResolvedValue([
      cancelledRun,
      { id: 2, name: 'Build [env: dev-cb]', isCompleted: true },
      { id: 3, name: 'Build [env: other]', isCompleted: false },
    ]);

  vi.useFakeTimers();
  const result = cancelWorkflowTask(new TaskController());
  await vi.advanceTimersByTimeAsync(0);

  expect(listWorkflowRuns).toHaveBeenCalledTimes(1);
  expect(cancelWorkflowRun).toHaveBeenCalledTimes(1);
  expect(cancelWorkflowRun).toHaveBeenCalledWith(1);

  await vi.advanceTimersByTimeAsync(10_000);
  await expect(result).resolves.toBe(true);
  expect(listWorkflowRuns).toHaveBeenCalledTimes(2);
});

test('the cancellation polls until the runs are completed', async () => {
  const { cancelWorkflowTask } = await load();
  listWorkflowRuns
    .mockResolvedValueOnce([runningRun])
    .mockResolvedValueOnce([runningRun])
    .mockResolvedValueOnce([runningRun])
    .mockResolvedValue([cancelledRun]);

  vi.useFakeTimers();
  const result = cancelWorkflowTask(new TaskController());
  await vi.advanceTimersByTimeAsync(30_000);

  await expect(result).resolves.toBe(true);
  // One list and three checks.
  expect(listWorkflowRuns).toHaveBeenCalledTimes(4);
  expect(cancelWorkflowRun).toHaveBeenCalledTimes(1);
});

test('the cancellation gives up after a minute', async () => {
  const { cancelWorkflowTask } = await load();
  listWorkflowRuns.mockResolvedValue([runningRun]);

  vi.useFakeTimers();
  const result = cancelWorkflowTask(new TaskController());
  await vi.advanceTimersByTimeAsync(60_000);

  await expect(result).resolves.toBe(true);
  // One list and six checks.
  expect(listWorkflowRuns).toHaveBeenCalledTimes(7);
});

test('a failing cancellation is logged instead of thrown', async () => {
  const { cancelWorkflowTask, output } = await load();
  listWorkflowRuns.mockRejectedValue(requestError);

  await expect(cancelWorkflowTask(new TaskController())).resolves.toBe(true);
  expect(output).toContain('❌ Error canceling the workflow\n');
  expect(output).toContain('Error: Resource not accessible by integration\n');
  expect(output).toContain('Status: 403\n');
  expect(consoleError).toHaveBeenCalledWith(
    'Resource not accessible by integration (status 403)',
  );
});
