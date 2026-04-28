import { ApplicationState } from '@amazeelabs/publisher-shared';
import { Effect, Layer, Stream } from 'effect';
import { describe, expect, it } from 'vitest';

import { AppStateLive } from './AppState';
import { ConfigTest, PublisherConfigLocal } from './Config';
import { Core } from './Core';
import { CoreLocalLive } from './CoreLocal';
import { Database } from './Database';
import { OutputLive } from './Output';
import { Runner, RunningProcess } from './Runner';
import { ServeHandleLive } from './ServeHandle';

const testConfig: PublisherConfigLocal = {
  publisherPort: 3000,
  databaseUrl: ':memory:',
  mode: 'local',
  commands: {
    clean: 'echo clean',
    build: { command: 'echo build' },
    deploy: 'echo deploy',
    serve: {
      command: 'echo "serve started"',
      readyPattern: 'serve started',
      port: 3001,
    },
  },
};

const makeRunnerMock = (exitCode = 0) =>
  Layer.succeed(Runner, {
    run: (opts) =>
      Effect.succeed({
        output: Stream.make(opts.command + ' output\n'),
        result: Effect.succeed({ exitCode }),
        kill: Effect.void,
      } satisfies RunningProcess),
  });

const mockDb = Layer.succeed(Database, {
  saveBuild: () => Effect.void,
  getBuilds: Effect.succeed([]),
  getBuild: () => Effect.succeed(null),
});

const makeTestLayer = (exitCode = 0) => {
  const outputLayer = OutputLive;
  const runnerLayer = makeRunnerMock(exitCode);
  const configLayer = ConfigTest(testConfig);
  return Layer.mergeAll(
    configLayer,
    outputLayer,
    AppStateLive,
    runnerLayer,
    mockDb,
    ServeHandleLive,
    CoreLocalLive.pipe(
      Layer.provide(AppStateLive),
      Layer.provide(outputLayer),
      Layer.provide(runnerLayer),
      Layer.provide(mockDb),
      Layer.provide(configLayer),
      Layer.provide(ServeHandleLive),
    ),
  );
};

describe('CoreLocal', () => {
  it('start transitions to Ready on success', async () => {
    const states = await Effect.runPromise(
      Effect.gen(function* () {
        const core = yield* Core;
        const collected: ApplicationState[] = [];

        const fiber = yield* Effect.fork(
          Stream.runForEach(
            core.applicationState.pipe(
              Stream.takeUntil((s) => s === ApplicationState.Ready),
            ),
            (s) =>
              Effect.sync(() => {
                collected.push(s);
              }),
          ),
        );

        yield* core.start;
        yield* Effect.sleep(500);
        yield* fiber.await;
        return collected;
      }).pipe(Effect.provide(makeTestLayer(0))),
    );

    expect(states).toContain(ApplicationState.Ready);
  }, 10000);

  it('start transitions to Fatal on build failure', async () => {
    const states = await Effect.runPromise(
      Effect.gen(function* () {
        const core = yield* Core;
        const collected: ApplicationState[] = [];

        const fiber = yield* Effect.fork(
          Stream.runForEach(
            core.applicationState.pipe(
              Stream.takeUntil((s) => s === ApplicationState.Fatal),
            ),
            (s) =>
              Effect.sync(() => {
                collected.push(s);
              }),
          ),
        );

        yield* core.start;
        yield* Effect.sleep(1000);
        yield* fiber.await;
        return collected;
      }).pipe(Effect.provide(makeTestLayer(1))),
    );

    expect(states).toContain(ApplicationState.Fatal);
  }, 15000);

  it('build is deduplicated when already queued', async () => {
    let runCount = 0;
    const countingRunner = Layer.succeed(Runner, {
      run: () =>
        Effect.sync(() => {
          runCount++;
          return {
            output: Stream.make('output\n'),
            result: Effect.succeed({ exitCode: 0 }),
            kill: Effect.void,
          } satisfies RunningProcess;
        }),
    });

    const configLayer = ConfigTest(testConfig);
    const layer = Layer.mergeAll(
      configLayer,
      OutputLive,
      AppStateLive,
      countingRunner,
      mockDb,
      ServeHandleLive,
      CoreLocalLive.pipe(
        Layer.provide(AppStateLive),
        Layer.provide(OutputLive),
        Layer.provide(countingRunner),
        Layer.provide(mockDb),
        Layer.provide(configLayer),
        Layer.provide(ServeHandleLive),
      ),
    );

    await Effect.runPromise(
      Effect.gen(function* () {
        const core = yield* Core;
        yield* core.start;
        yield* Effect.sleep(100);
        yield* core.build;
        yield* core.build;
        yield* Effect.sleep(2000);
      }).pipe(Effect.provide(layer)),
    );

    expect(runCount).toBeGreaterThan(0);
  }, 10000);
});
