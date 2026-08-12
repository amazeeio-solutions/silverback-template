import { afterEach, beforeEach, expect, MockInstance, test, vi } from 'vitest';

import { ApplicationState, WorkflowPublisherPayload } from '../shared/exports';
import { PublisherConfigGithubWorkflow } from '../tools/config';
import { TaskController } from '../tools/queue';

const { execSync, saveBuildInfo } = vi.hoisted(() => ({
  execSync: vi.fn(),
  saveBuildInfo: vi.fn(),
}));

vi.mock('node:child_process', () => ({ execSync }));
vi.mock('../tools/database', () => ({ saveBuildInfo }));

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

const listCommand =
  'gh run list --workflow=build.yml --repo AmazeeLabs/project --json name,conclusion,databaseId --limit 100';

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
  const options = execSync.mock.calls[call]![1] as { input: string };
  return JSON.parse(options.input) as Record<string, string>;
};

const workflowRunPayload = (call: number): WorkflowPublisherPayload => {
  return JSON.parse(
    workflowRunInputs(call).publisher_payload!,
  ) as WorkflowPublisherPayload;
};

const execError = Object.assign(new Error('Command failed'), {
  status: 42,
  stdout: Buffer.from('some stdout'),
  stderr: Buffer.from('some stderr'),
});

let consoleError: MockInstance;

beforeEach(() => {
  consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  execSync.mockReset();
  execSync.mockReturnValue('[]');
  saveBuildInfo.mockReset();
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
  expect(saveBuildInfo).toHaveBeenCalledTimes(1);
  expect(saveBuildInfo).toHaveBeenCalledWith(
    expect.objectContaining({ type: 'github-workflow', success: true }),
  );
  const { logs, startedAt, finishedAt } = saveBuildInfo.mock.calls[0]![0];
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
  expect(execSync).toHaveBeenCalledTimes(3);
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
  expect(saveBuildInfo).toHaveBeenCalledWith(
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
  expect(execSync).toHaveBeenCalledTimes(2);
  expect(states).toStrictEqual([
    ApplicationState.Starting,
    ApplicationState.Ready,
    ApplicationState.Updating,
    ApplicationState.Error,
  ]);
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

test('the workflow run command and inputs are built from the config', async () => {
  const { core, buildTask } = await load();
  const result = buildTask({ clean: true })(new TaskController());

  expect(execSync).toHaveBeenCalledTimes(1);
  expect(execSync.mock.calls[0]![0]).toBe(
    'gh workflow run build.yml --repo AmazeeLabs/project --ref dev --json',
  );
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
  expect(execSync).toHaveBeenCalledTimes(1);
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

test('a failing gh command fails the build attempt and logs the error', async () => {
  const { core, buildTask, output } = await load();
  const firstBuild = buildTask()(new TaskController());
  core.state.workflowState$.next('success');
  await firstBuild;

  execSync.mockImplementation(() => {
    throw execError;
  });
  await expect(buildTask()(new TaskController())).resolves.toBe(false);

  expect(output).toContain('❌ Error starting the workflow\n');
  expect(output).toContain('Error: Error: Command failed\n');
  expect(output).toContain('Exit code: 42\n');
  expect(output).toContain('Stdout: some stdout\n');
  expect(output).toContain('Stderr: some stderr\n');
  expect(consoleError).toHaveBeenCalledWith(execError);
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
  expect(execSync).toHaveBeenCalledWith(listCommand);
});

test('only uncompleted runs of the environment are cancelled', async () => {
  const { cancelWorkflowTask } = await load();
  execSync
    .mockReturnValueOnce(
      JSON.stringify([
        { name: 'Build [env: dev-cb]', conclusion: '', databaseId: 1 },
        { name: 'Build [env: dev-cb]', conclusion: 'success', databaseId: 2 },
        { name: 'Build [env: other]', conclusion: '', databaseId: 3 },
      ]),
    )
    .mockReturnValue(
      JSON.stringify([
        { name: 'Build [env: dev-cb]', conclusion: 'cancelled', databaseId: 1 },
        { name: 'Build [env: dev-cb]', conclusion: 'success', databaseId: 2 },
        { name: 'Build [env: other]', conclusion: '', databaseId: 3 },
      ]),
    );

  vi.useFakeTimers();
  const result = cancelWorkflowTask(new TaskController());

  expect(execSync).toHaveBeenNthCalledWith(1, listCommand);
  expect(execSync).toHaveBeenNthCalledWith(
    2,
    'gh run cancel 1 --repo AmazeeLabs/project',
  );
  expect(execSync).toHaveBeenCalledTimes(2);

  await vi.advanceTimersByTimeAsync(10_000);
  await expect(result).resolves.toBe(true);
  expect(execSync).toHaveBeenNthCalledWith(3, listCommand);
  expect(execSync).toHaveBeenCalledTimes(3);
});

test('the cancellation polls until the runs are completed', async () => {
  const { cancelWorkflowTask } = await load();
  const runningRuns = JSON.stringify([
    { name: 'Build [env: dev-cb]', conclusion: '', databaseId: 1 },
  ]);
  const completedRuns = JSON.stringify([
    { name: 'Build [env: dev-cb]', conclusion: 'cancelled', databaseId: 1 },
  ]);
  execSync
    .mockReturnValueOnce(runningRuns)
    .mockReturnValueOnce('')
    .mockReturnValueOnce(runningRuns)
    .mockReturnValueOnce(runningRuns)
    .mockReturnValue(completedRuns);

  vi.useFakeTimers();
  const result = cancelWorkflowTask(new TaskController());
  await vi.advanceTimersByTimeAsync(30_000);

  await expect(result).resolves.toBe(true);
  expect(execSync).toHaveBeenCalledTimes(5);
});

test('the cancellation gives up after a minute', async () => {
  const { cancelWorkflowTask } = await load();
  execSync.mockReturnValue(
    JSON.stringify([
      { name: 'Build [env: dev-cb]', conclusion: '', databaseId: 1 },
    ]),
  );

  vi.useFakeTimers();
  const result = cancelWorkflowTask(new TaskController());
  await vi.advanceTimersByTimeAsync(60_000);

  await expect(result).resolves.toBe(true);
  // One list, one cancellation and six checks.
  expect(execSync).toHaveBeenCalledTimes(8);
});

test('a failing cancellation is logged instead of thrown', async () => {
  const { cancelWorkflowTask, output } = await load();
  execSync.mockImplementation(() => {
    throw execError;
  });

  await expect(cancelWorkflowTask(new TaskController())).resolves.toBe(true);
  expect(output).toContain('❌ Error canceling the workflow\n');
  expect(output).toContain('Exit code: 42\n');
  expect(consoleError).toHaveBeenCalledWith(execError);
});
