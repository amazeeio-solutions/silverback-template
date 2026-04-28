import { Effect, Ref, Schedule } from 'effect';

import {
  AppState,
  setBuildJobState,
} from '../../../services/AppState';
import { localConfig as getLocalConfig } from '../../../services/Config';
import { Runner } from '../../../services/Runner';
import { cleanRunTask } from '../clean/cleanRun';

export const buildRunTask = Effect.gen(function* () {
  const appState = yield* AppState;
  const runner = yield* Runner;
  const localConfig = yield* getLocalConfig;

  yield* appState.update(setBuildJobState('InProgress'));

  const { command, outputTimeout } = localConfig.commands.build;
  const attemptRef = yield* Ref.make(0);

  const runOnce = Effect.gen(function* () {
    const attempt = yield* Ref.updateAndGet(attemptRef, (n) => n + 1);
    if (attempt === 2) {
      const { buildNumber } = yield* appState.get;
      if (buildNumber === 1) {
        yield* cleanRunTask;
      }
    }
    const proc = yield* runner.run({ command, outputTimeout });
    const { exitCode } = yield* proc.result;
    if (exitCode !== 0) {
      return yield* Effect.fail('non-zero exit' as const);
    }
  });

  const result = yield* runOnce.pipe(
    Effect.retry(Schedule.recurs(2)),
    Effect.option,
  );

  if (result._tag === 'Some') {
    yield* appState.update(setBuildJobState('Success'));
    return true;
  }

  yield* appState.update(setBuildJobState('Error'));
  return false;
});
