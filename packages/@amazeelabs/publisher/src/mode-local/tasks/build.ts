import { Effect, Fiber, Stream } from 'effect';

import {
  AppState,
  incrementBuildNumber,
  setBuildOverall,
} from '../../services/AppState';
import { Database } from '../../services/Database';
import { Output } from '../../services/Output';
import { buildDeployTask } from './build/buildDeploy';
import { buildRunTask } from './build/buildRun';
import { serveStartTask } from './serve/serveStart';

export const buildTask = Effect.scoped(
  Effect.gen(function* () {
    const appState = yield* AppState;
    const output = yield* Output;
    const db = yield* Database;

    yield* appState.update(incrementBuildNumber);
    yield* appState.update(setBuildOverall('InProgress'));

    const startedAt = Date.now();
    const outputLog: Array<string> = [];

    const queue = yield* output.subscribe;
    const collectFiber = yield* Effect.fork(
      Stream.runForEach(Stream.fromQueue(queue), (chunk) =>
        Effect.sync(() => {
          outputLog.push(
            `${new Date().toISOString().substring(0, 19).replace('T', ' ')} ${chunk}`,
          );
        }),
      ),
    );

    const saveBuildLogs = Effect.gen(function* () {
      const { buildNumber, buildState } = yield* appState.get;
      yield* db.saveBuild({
        type: buildNumber === 1 ? 'full' : 'incremental',
        startedAt,
        finishedAt: Date.now(),
        success:
          buildState.buildJob === 'Success' &&
          buildState.deployJob === 'Success',
        logs: outputLog.join(''),
      });
    });

    const buildResult = yield* buildRunTask;
    if (!buildResult) {
      yield* appState.update(setBuildOverall('Done'));
      yield* Fiber.interrupt(collectFiber);
      yield* saveBuildLogs;
      return;
    }

    yield* serveStartTask;
    yield* buildDeployTask;

    yield* appState.update(setBuildOverall('Done'));
    yield* Fiber.interrupt(collectFiber);
    yield* saveBuildLogs;
  }),
);
