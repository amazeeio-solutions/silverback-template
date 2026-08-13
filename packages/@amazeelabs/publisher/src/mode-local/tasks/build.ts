import { BuildLog } from '../../tools/buildLog';
import { saveBuildInfoSafely } from '../../tools/database';
import { Queue, TaskJob } from '../../tools/queue';
import { core } from '../core';
import { buildDeployTask } from './build/buildDeploy';
import { buildRunTask } from './build/buildRun';
import { serveStartTask } from './serve/serveStart';

export const buildTask: () => TaskJob = () => (controller) => {
  core.state.startBuild();

  const startedAt = Date.now();
  const output = new BuildLog();
  const outputSubscription = core.output$.subscribe((chunk) => {
    output.append(
      `${new Date().toISOString().substring(0, 19).replace('T', ' ')} ${chunk}`,
    );
  });
  const saveBuildLogs = (): void => {
    saveBuildInfoSafely({
      type: core.state.getBuildNumber() === 1 ? 'full' : 'incremental',
      startedAt,
      finishedAt: Date.now(),
      success:
        core.state.getBuildJobState() === 'Success' &&
        core.state.getDeployJobState() === 'Success',
      logs: output.toString(),
    });
    outputSubscription.unsubscribe();
  };

  return new Promise((resolve) => {
    const queue = new Queue();

    // Clearing the queue makes it idle, so both the cancel handler and the idle
    // handler below reach settle(). Whichever arrives first commits the outcome,
    // and cancellation is already recorded by then.
    let cancelled = false;
    let settled = false;
    const settle = (): void => {
      if (settled) {
        return;
      }
      settled = true;
      if (cancelled) {
        core.state.cancelBuild();
      } else {
        core.state.finishBuild();
      }
      saveBuildLogs();
      resolve(!cancelled);
    };

    controller.onCancel(async () => {
      cancelled = true;
      await queue.clear();
      settle();
    });

    queue.add({
      job: buildRunTask,
      options: { shouldStopQueueOnFailure: true },
    });

    queue.add({ job: serveStartTask });

    queue.add({ job: buildDeployTask });

    queue.run();
    // eslint-disable-next-line promise/catch-or-return,promise/always-return
    queue.whenIdle.then(() => settle());
  });
};
