import { Effect, Layer, Option, Ref } from 'effect';

import { buildTask } from '../mode-local/tasks/build';
import { cleanRunTask } from '../mode-local/tasks/clean/cleanRun';
import { serveStopTask } from '../mode-local/tasks/serve/serveStop';
import { AppState } from './AppState';
import { Config } from './Config';
import { Core } from './Core';
import { Database } from './Database';
import { makeTaskQueue } from './makeTaskQueue';
import { Output } from './Output';
import { Runner } from './Runner';
import { ServeHandle } from './ServeHandle';

type TaskDeps = AppState | Config | Database | Output | Runner | ServeHandle;

export const CoreLocalLive = Layer.effect(
  Core,
  Effect.gen(function* () {
    const appState = yield* AppState;
    const { processRef } = yield* ServeHandle;
    const queue = yield* makeTaskQueue;
    const taskContext = yield* Effect.context<TaskDeps>();

    const provide = <A>(effect: Effect.Effect<A, never, TaskDeps>) =>
      Effect.provide(effect, taskContext);

    const start = queue.addAndRun(provide(buildTask));

    const stop = Effect.gen(function* () {
      yield* queue.clear;
      const current = yield* Ref.get(processRef);
      if (Option.isSome(current)) {
        yield* current.value.kill;
      }
    });

    const build = Effect.gen(function* () {
      const tasks = yield* queue.getPending;
      if (tasks.length === 0) {
        yield* queue.addAndRun(provide(buildTask));
      }
    });

    const clean = Effect.gen(function* () {
      yield* queue.clear;
      yield* appState.reset;
      yield* queue.addAndRun(provide(serveStopTask));
      yield* queue.addPending([provide(cleanRunTask), provide(buildTask)]);
    });

    return {
      applicationState: appState.applicationState,
      start,
      stop,
      build,
      clean,
      getBuildNumber: Effect.map(appState.get, (s) => s.buildNumber),
    };
  }),
);
