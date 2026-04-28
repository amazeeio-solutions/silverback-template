import { Effect, Schedule } from 'effect';

import {
  AppState,
  setDeployJobState,
} from '../../../services/AppState';
import { localConfig as getLocalConfig } from '../../../services/Config';
import { Runner } from '../../../services/Runner';

export const buildDeployTask = Effect.gen(function* () {
  const appState = yield* AppState;
  const runner = yield* Runner;
  const localConfig = yield* getLocalConfig;

  yield* appState.update(setDeployJobState('InProgress'));

  const command = localConfig.commands.deploy;
  if (!command) {
    yield* appState.update(setDeployJobState('Success'));
    return true;
  }

  const runOnce = Effect.gen(function* () {
    const proc = yield* runner.run({ command });
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
    yield* appState.update(setDeployJobState('Success'));
    return true;
  }

  yield* appState.update(setDeployJobState('Error'));
  return false;
});
