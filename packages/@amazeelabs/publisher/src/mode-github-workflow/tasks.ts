import { skip, Subscription } from 'rxjs';

import { ApplicationState, WorkflowPublisherPayload } from '../shared/exports';
import { BuildLog } from '../tools/buildLog';
import { getConfigGithubWorkflow as config } from '../tools/config';
import { saveBuildInfoSafely } from '../tools/database';
import { TaskController, TaskJob } from '../tools/queue';
import { core } from './core';
import {
  cancelWorkflowRun,
  dispatchWorkflow,
  listWorkflowRuns,
  WorkflowRun,
} from './github';

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

    // The dispatch is a request now, so the state is observed before it, to
    // keep the callback of a fast workflow from being missed.
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

    const startWorkflow = async (): Promise<void> => {
      await dispatchWorkflow({
        ...config().inputs,
        publisher_payload: JSON.stringify({
          callbackUrl: config().publisherBaseUrl + '/github-workflow-status',
          clearCache: args.clean,
          environmentVariables: config().environmentVariables,
        } satisfies WorkflowPublisherPayload),
      });
    };

    void startWorkflow().catch((error: unknown) => {
      core.output$.next('Error starting the workflow', 'error');
      logGithubError(error);
      settle('failure');
    });
  });
}

export const cancelWorkflowTask: TaskJob = async () => {
  await cancelWorkflow();
  return true;
};

async function cancelWorkflow(): Promise<void> {
  function matchesEnvironment(run: WorkflowRun): boolean {
    return run.name.includes(`[env: ${config().environment}]`);
  }

  try {
    // Cancel the running workflows.
    const runs = await listWorkflowRuns();
    for (const run of runs) {
      if (!run.isCompleted && matchesEnvironment(run)) {
        await cancelWorkflowRun(run.id);
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
      const remaining = await listWorkflowRuns();
      if (
        remaining.every((run) => run.isCompleted || !matchesEnvironment(run))
      ) {
        return;
      }
    }
  } catch (error) {
    core.output$.next('Error canceling the workflow', 'error');
    logGithubError(error);
  }
}

type RequestError = Error & { status: number };

function isRequestError(error: unknown): error is RequestError {
  return error instanceof Error && 'status' in error;
}

function logGithubError(error: unknown): void {
  if (isRequestError(error)) {
    core.output$.next(`Error: ${error.message}`);
    core.output$.next(`Status: ${error.status}`);
    // Only the message is printed, because the error carries the request it was
    // made with, and the dispatch body holds the environment variables of the
    // build - secrets included.
    console.error(`${error.message} (status ${error.status})`);
    return;
  }
  if (error instanceof Error) {
    core.output$.next(`Error: ${error.message}`);
  } else {
    core.output$.next(`Error: ${String(error)}`);
  }
  console.error(error);
}
