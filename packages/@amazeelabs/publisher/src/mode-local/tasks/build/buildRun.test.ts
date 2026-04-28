import { Effect, Layer, Stream } from 'effect';
import { describe, expect, it } from 'vitest';

import {
  AppState,
  AppStateLive,
  incrementBuildNumber,
} from '../../../services/AppState';
import {
  Config,
  ConfigTest,
  PublisherConfigLocal,
} from '../../../services/Config';
import { OutputLive } from '../../../services/Output';
import { Runner, RunningProcess } from '../../../services/Runner';
import { buildRunTask } from './buildRun';

const testConfig: PublisherConfigLocal = {
  publisherPort: 3000,
  databaseUrl: ':memory:',
  mode: 'local',
  commands: {
    clean: 'echo clean',
    build: { command: 'echo build' },
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

describe('buildRunTask', () => {
  it('succeeds on first attempt', async () => {
    const result = await run(buildRunTask, [0]);
    expect(result).toBe(true);
  });

  it('retries and succeeds on third attempt', async () => {
    const result = await run(buildRunTask, [1, 1, 0]);
    expect(result).toBe(true);
  });

  it('fails after 3 attempts', async () => {
    const result = await run(buildRunTask, [1, 1, 1]);
    expect(result).toBe(false);
  });

  it('sets build job state to Error on failure', async () => {
    const state = await run(
      Effect.gen(function* () {
        yield* buildRunTask;
        const appState = yield* AppState;
        return (yield* appState.get).buildState.buildJob;
      }),
      [1, 1, 1],
    );
    expect(state).toBe('Error');
  });

  it('sets build job state to Success on success', async () => {
    const state = await run(
      Effect.gen(function* () {
        yield* buildRunTask;
        const appState = yield* AppState;
        return (yield* appState.get).buildState.buildJob;
      }),
      [0],
    );
    expect(state).toBe('Success');
  });

  it('runs clean on second attempt for first build', async () => {
    const commands: string[] = [];
    const layer = Layer.mergeAll(
      AppStateLive,
      OutputLive,
      ConfigTest(testConfig),
      Layer.succeed(Runner, {
        run: (opts) =>
          Effect.sync(() => {
            commands.push(opts.command);
            const code = opts.command === 'echo build' ? 1 : 0;
            return {
              output: Stream.empty,
              result: Effect.succeed({ exitCode: code }),
              kill: Effect.void,
            } satisfies RunningProcess;
          }),
      }),
    );

    await Effect.runPromise(
      Effect.gen(function* () {
        const appState = yield* AppState;
        yield* appState.update(incrementBuildNumber);
        yield* buildRunTask;
      }).pipe(Effect.provide(layer)),
    );

    expect(commands).toContain('echo clean');
  });
});
