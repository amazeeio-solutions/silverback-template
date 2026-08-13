import { execSync, SpawnSyncReturns } from 'node:child_process';

import { skip, Subscription } from 'rxjs';

import { ApplicationState, WorkflowPublisherPayload } from '../shared/exports';
import { BuildLog } from '../tools/buildLog';
import { getConfigGithubWorkflow as config } from '../tools/config';
import { saveBuildInfoSafely } from '../tools/database';
import { TaskController, TaskJob } from '../tools/queue';
import { core } from './core';

export const buildTask: (args?: { clean: boolean }) => TaskJob =
  (args) => async (controller) => {
    core.state.buildNumber++;
    core.state.applicationState$.next(
      core.state.buildNumber === 1
        ? ApplicationState.Starting
        : ApplicationState.Updating,
    );

    const startedAt = Date.now();

    const output = new BuildLog();
    const outputSubscription = core.output$.subscribe((chunk) => {
      output.append(
        `${new Date().toISOString().substring(0, 19).replace('T', ' ')} ${chunk}`,
      );
    });

    const saveBuild = (isSuccess: boolean): void => {
      saveBuildInfoSafely({
        type: 'github-workflow',
        startedAt,
        finishedAt: Date.now(),
        success: isSuccess,
        logs: output.toString(),
      });
      outputSubscription.unsubscribe();
    };

    const finalizeBuild = (isSuccess: boolean): boolean => {
      core.state.applicationState$.next(
        isSuccess ? ApplicationState.Ready : ApplicationState.Error,
      );
      saveBuild(isSuccess);
      return isSuccess;
    };

    // A build nobody waited for has no outcome, so it is not reported as one.
    const finalizeCancelledBuild = (): boolean => {
      saveBuild(false);
      return false;
    };

    const attempts =
      core.state.buildNumber === 1
        ? 3 // The first build gets 3 attempts.
        : 1;
    for (let attempt = 1; attempt <= attempts; attempt++) {
      const result =
        attempt === 2
          ? await runWorkflow({ controller, clean: true })
          : await runWorkflow({ controller, clean: !!args?.clean });
      if (result === 'cancelled') {
        return finalizeCancelledBuild();
      }
      if (result === 'success') {
        return finalizeBuild(true);
      }
    }
    return finalizeBuild(false);
  };

type WorkflowRunResult = 'success' | 'failure' | 'cancelled';

async function runWorkflow(args: {
  clean: boolean;
  controller: TaskController;
}): Promise<WorkflowRunResult> {
  return new Promise<WorkflowRunResult>((resolve) => {
    if (args.clean) {
      core.output$.next('Starting the workflow (clean build 🧹)', 'info');
    } else {
      core.output$.next('Starting the workflow', 'info');
    }

    let subscription: Subscription | null = null;

    // The controller belongs to the whole build task, so this attempt has to
    // stop listening once it is over. Otherwise a later cancellation reaches
    // every attempt the build has made so far.
    const settle = (result: WorkflowRunResult): void => {
      clearTimeout(timeout);
      args.controller.offCancel(onCancel);
      subscription?.unsubscribe();
      resolve(result);
    };

    const abortWorkflow = async (result: WorkflowRunResult): Promise<void> => {
      core.output$.next('Cancelling the workflow', 'warning');
      await cancelWorkflow();
      settle(result);
    };

    // A timeout is a failed attempt, unlike a cancellation, so the build keeps
    // its remaining attempts.
    const timeout = setTimeout(() => {
      core.output$.next('Timeout reached', 'error');
      void abortWorkflow('failure');
    }, config().workflowTimeout);

    const onCancel = (): void => {
      void abortWorkflow('cancelled');
    };
    args.controller.onCancel(onCancel);

    try {
      execSync(
        `gh workflow run ${config().workflow} --repo ${config().repo} --ref ${config().ref} --json`,
        {
          input: JSON.stringify({
            ...config().inputs,
            publisher_payload: JSON.stringify({
              callbackUrl:
                config().publisherBaseUrl + '/github-workflow-status',
              clearCache: args.clean,
              environmentVariables: config().environmentVariables,
            } satisfies WorkflowPublisherPayload),
          }),
        },
      );
    } catch (error) {
      core.output$.next('Error starting the workflow', 'error');
      logExecError(error);

      return settle('failure');
    }

    subscription = core.state.workflowState$
      .pipe(
        // Ignore the initial state, or the state coming from the previous build.
        skip(1),
      )
      .subscribe((state) => {
        if (state === 'started') {
          core.output$.next('Workflow started', 'info');
          core.output$.next('Logs: ' + core.state.workflowRunUrl);
          return;
        }
        if (state === 'success' || state === 'failure') {
          if (state === 'success') {
            core.output$.next('Workflow succeeded', 'success');
          } else {
            core.output$.next('Workflow failed or cancelled', 'error');
          }
          core.output$.next('Logs: ' + core.state.workflowRunUrl);
          return settle(state);
        }
      });
  });
}

export const cancelWorkflowTask: TaskJob = async () => {
  await cancelWorkflow();
  return true;
};

async function cancelWorkflow(): Promise<void> {
  type Run = { name: string; conclusion: string; databaseId: number };

  function matchesEnvironment(run: Run): boolean {
    return run.name.includes(`[env: ${config().environment}]`);
  }
  function isCompleted(run: Run): boolean {
    return !!run.conclusion;
  }

  const listCommand = `gh run list --workflow=${config().workflow} --repo ${config().repo} --json name,conclusion,databaseId --limit 100`;

  try {
    // Cancel the running workflows.
    const result = execSync(listCommand).toString();
    const runs = JSON.parse(result) as Array<Run>;
    for (const run of runs) {
      if (!isCompleted(run) && matchesEnvironment(run)) {
        execSync(`gh run cancel ${run.databaseId} --repo ${config().repo}`);
      }
    }

    // Wait for the workflows to stop. Give it a minute.
    // This may slightly impact the GitHub API rate limits, but cancellations
    // are quite rare operations.
    const checkAttempts = 6;
    const delay = 10_000;
    // FIXME: the delay runs before the first check, so start() is held up by
    // 10s even when there is nothing to cancel.
    for (let checkAttempt = 1; checkAttempt <= checkAttempts; checkAttempt++) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      const result = execSync(listCommand).toString();
      const runs = JSON.parse(result) as Array<Run>;
      if (runs.every((run) => isCompleted(run) || !matchesEnvironment(run))) {
        return;
      }
    }
  } catch (error) {
    core.output$.next('Error canceling the workflow', 'error');
    logExecError(error);
  }
}

function isSpawnError(error: unknown): error is SpawnSyncReturns<Buffer> {
  return !!error && typeof error === 'object' && 'status' in error;
}

function logExecError(error: unknown): void {
  if (isSpawnError(error)) {
    core.output$.next(`Error: ${error}`);
    core.output$.next(`Exit code: ${error.status}`);
    core.output$.next(`Stdout: ${error.stdout?.toString()}`);
    core.output$.next(`Stderr: ${error.stderr?.toString()}`);
  }
  console.error(error);
}
