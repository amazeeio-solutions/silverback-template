import { Effect, Layer, Stream } from 'effect';
import { describe, expect, it } from 'vitest';

import { AppState, AppStateLive } from '../../../services/AppState';
import {
  Config,
  ConfigTest,
  PublisherConfigLocal,
} from '../../../services/Config';
import { OutputLive } from '../../../services/Output';
import { Runner, RunningProcess } from '../../../services/Runner';
import { buildDeployTask } from './buildDeploy';

const testConfig: PublisherConfigLocal = {
  publisherPort: 3000,
  databaseUrl: ':memory:',
  mode: 'local',
  commands: {
    clean: 'echo clean',
    build: { command: 'echo build' },
    deploy: 'echo deploy',
  },
};

const makeRunnerMock = (exitCodes: number[]) => {
  let callIndex = 0;
  return Layer.succeed(Runner, {
    run: () =>
      Effect.sync(() => {
        const code = exitCodes[callIndex++] ?? 1;
        return {
          output: Stream.empty,
          result: Effect.succeed({ exitCode: code }),
          kill: Effect.void,
        } satisfies RunningProcess;
      }),
  });
};

const testLayer = (exitCodes: number[]) =>
  Layer.mergeAll(
    AppStateLive,
    OutputLive,
    ConfigTest(testConfig),
    makeRunnerMock(exitCodes),
  );

const run = <A>(
  effect: Effect.Effect<A, never, AppState | Config | Runner>,
  exitCodes: number[],
) => Effect.runPromise(effect.pipe(Effect.provide(testLayer(exitCodes))));

describe('buildDeployTask', () => {
  it('succeeds on first attempt', async () => {
    const result = await run(buildDeployTask, [0]);
    expect(result).toBe(true);
  });

  it('retries and succeeds on third attempt', async () => {
    const result = await run(buildDeployTask, [1, 1, 0]);
    expect(result).toBe(true);
  });

  it('fails after 3 attempts', async () => {
    const result = await run(buildDeployTask, [1, 1, 1]);
    expect(result).toBe(false);
  });

  it('sets deploy job state to Error on failure', async () => {
    const state = await run(
      Effect.gen(function* () {
        yield* buildDeployTask;
        const appState = yield* AppState;
        return (yield* appState.get).buildState.deployJob;
      }),
      [1, 1, 1],
    );
    expect(state).toBe('Error');
  });

  it('sets deploy job state to Success on success', async () => {
    const state = await run(
      Effect.gen(function* () {
        yield* buildDeployTask;
        const appState = yield* AppState;
        return (yield* appState.get).buildState.deployJob;
      }),
      [0],
    );
    expect(state).toBe('Success');
  });

  it('skips deploy when no deploy command', async () => {
    const configNoDeploy: PublisherConfigLocal = {
      ...testConfig,
      commands: { ...testConfig.commands, deploy: undefined },
    };
    const layer = Layer.mergeAll(
      AppStateLive,
      OutputLive,
      ConfigTest(configNoDeploy),
      makeRunnerMock([]),
    );
    const result = await Effect.runPromise(
      buildDeployTask.pipe(Effect.provide(layer)),
    );
    expect(result).toBe(true);
  });
});
