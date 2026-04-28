import { Effect } from 'effect';

import { AppState, setCleanState } from '../../../services/AppState';
import { localConfig as getLocalConfig } from '../../../services/Config';
import { Runner } from '../../../services/Runner';

export const cleanRunTask = Effect.gen(function* () {
  const appState = yield* AppState;
  const runner = yield* Runner;
  const localConfig = yield* getLocalConfig;

  yield* appState.update(setCleanState('InProgress'));
  const proc = yield* runner.run({ command: localConfig.commands.clean });
  const { exitCode } = yield* proc.result;
  const success = exitCode === 0;
  yield* appState.update(setCleanState(success ? 'Success' : 'Error'));
  return success;
});
