import { ApplicationState } from '@amazeelabs/publisher-shared';
import { Effect, Stream } from 'effect';
import { describe, expect, it } from 'vitest';

import {
  AppState,
  AppStateLive,
  computeApplicationState,
  incrementBuildNumber,
  setBuildJobState,
  setBuildOverall,
  setDeployJobState,
} from './AppState';

describe('computeApplicationState', () => {
  it('returns Starting when build not started', () => {
    expect(
      computeApplicationState({
        buildNumber: 0,
        buildState: {
          buildJob: 'NotStarted',
          deployJob: 'NotStarted',
          overall: 'NotStarted',
        },
        cleanState: 'NotStarted',
      }),
    ).toBe(ApplicationState.Starting);
  });

  it('returns Starting when first build in progress', () => {
    expect(
      computeApplicationState({
        buildNumber: 1,
        buildState: {
          buildJob: 'InProgress',
          deployJob: 'NotStarted',
          overall: 'InProgress',
        },
        cleanState: 'NotStarted',
      }),
    ).toBe(ApplicationState.Starting);
  });

  it('returns Updating when subsequent build in progress', () => {
    expect(
      computeApplicationState({
        buildNumber: 2,
        buildState: {
          buildJob: 'InProgress',
          deployJob: 'NotStarted',
          overall: 'InProgress',
        },
        cleanState: 'NotStarted',
      }),
    ).toBe(ApplicationState.Updating);
  });

  it('returns Ready when build and deploy succeed', () => {
    expect(
      computeApplicationState({
        buildNumber: 1,
        buildState: {
          buildJob: 'Success',
          deployJob: 'Success',
          overall: 'Done',
        },
        cleanState: 'NotStarted',
      }),
    ).toBe(ApplicationState.Ready);
  });

  it('returns Fatal on first build failure', () => {
    expect(
      computeApplicationState({
        buildNumber: 1,
        buildState: {
          buildJob: 'Error',
          deployJob: 'NotStarted',
          overall: 'Done',
        },
        cleanState: 'NotStarted',
      }),
    ).toBe(ApplicationState.Fatal);
  });

  it('returns Error on subsequent build failure', () => {
    expect(
      computeApplicationState({
        buildNumber: 2,
        buildState: {
          buildJob: 'Error',
          deployJob: 'NotStarted',
          overall: 'Done',
        },
        cleanState: 'NotStarted',
      }),
    ).toBe(ApplicationState.Error);
  });

  it('returns Starting when clean is in progress', () => {
    expect(
      computeApplicationState({
        buildNumber: 2,
        buildState: {
          buildJob: 'Success',
          deployJob: 'Success',
          overall: 'Done',
        },
        cleanState: 'InProgress',
      }),
    ).toBe(ApplicationState.Starting);
  });
});

describe('AppState service', () => {
  const run = <A>(effect: Effect.Effect<A, never, AppState>) =>
    Effect.runPromise(effect.pipe(Effect.provide(AppStateLive)));

  it('starts with buildNumber 0', async () => {
    const result = await run(
      Effect.gen(function* () {
        const appState = yield* AppState;
        return (yield* appState.get).buildNumber;
      }),
    );
    expect(result).toBe(0);
  });

  it('increments build number', async () => {
    const result = await run(
      Effect.gen(function* () {
        const appState = yield* AppState;
        yield* appState.update(incrementBuildNumber);
        yield* appState.update(incrementBuildNumber);
        return (yield* appState.get).buildNumber;
      }),
    );
    expect(result).toBe(2);
  });

  it('emits distinct application states', async () => {
    const states = await run(
      Effect.gen(function* () {
        const appState = yield* AppState;
        const collected: ApplicationState[] = [];

        const fiber = yield* Effect.fork(
          Stream.runForEach(
            appState.applicationState.pipe(Stream.take(3)),
            (s) =>
              Effect.sync(() => {
                collected.push(s);
              }),
          ),
        );

        yield* Effect.sleep(50);
        yield* appState.update(incrementBuildNumber);
        yield* appState.update(incrementBuildNumber);
        yield* appState.update(setBuildOverall('InProgress'));
        yield* appState.update(setBuildJobState('InProgress'));
        yield* appState.update(setBuildJobState('Success'));
        yield* appState.update(setDeployJobState('InProgress'));
        yield* appState.update(setDeployJobState('Success'));
        yield* appState.update(setBuildOverall('Done'));

        yield* fiber.await;
        return collected;
      }),
    );

    expect(states).toEqual([
      ApplicationState.Starting,
      ApplicationState.Updating,
      ApplicationState.Ready,
    ]);
  });
});
