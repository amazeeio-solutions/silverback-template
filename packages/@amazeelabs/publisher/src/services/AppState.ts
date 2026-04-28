import { ApplicationState } from '@amazeelabs/publisher-shared';
import { Context, Effect, Layer, Stream, SubscriptionRef } from 'effect';

type ProcessState = 'NotStarted' | 'InProgress' | 'Success' | 'Error';

export type LocalState = {
  buildNumber: number;
  buildState: {
    buildJob: ProcessState;
    deployJob: ProcessState;
    overall: 'NotStarted' | 'InProgress' | 'Done';
  };
  cleanState: ProcessState;
};

const initialState: LocalState = {
  buildNumber: 0,
  buildState: {
    buildJob: 'NotStarted',
    deployJob: 'NotStarted',
    overall: 'NotStarted',
  },
  cleanState: 'NotStarted',
};

export const computeApplicationState = ({
  buildState: { buildJob, deployJob, overall: buildOverall },
  cleanState: cleanJob,
  buildNumber,
}: LocalState): ApplicationState => {
  if (buildOverall === 'NotStarted') {
    return ApplicationState.Starting;
  }
  if (buildOverall === 'InProgress') {
    return buildNumber === 1
      ? ApplicationState.Starting
      : ApplicationState.Updating;
  }
  if (cleanJob === 'InProgress') {
    return ApplicationState.Starting;
  }
  if (buildJob === 'Error' || deployJob === 'Error' || cleanJob === 'Error') {
    return buildNumber === 1 ? ApplicationState.Fatal : ApplicationState.Error;
  }
  if (
    buildOverall === 'Done' &&
    buildJob === 'Success' &&
    deployJob === 'Success'
  ) {
    return ApplicationState.Ready;
  }
  return ApplicationState.Error;
};

export class AppState extends Context.Tag('AppState')<
  AppState,
  {
    readonly get: Effect.Effect<LocalState>;
    readonly update: (fn: (s: LocalState) => LocalState) => Effect.Effect<void>;
    readonly applicationState: Stream.Stream<ApplicationState>;
    readonly reset: Effect.Effect<void>;
  }
>() {}

export const AppStateLive = Layer.effect(
  AppState,
  Effect.gen(function* () {
    const ref = yield* SubscriptionRef.make(initialState);

    const get = SubscriptionRef.get(ref);
    const update = (fn: (s: LocalState) => LocalState) =>
      SubscriptionRef.update(ref, fn);

    const applicationState = Stream.changes(
      Stream.map(ref.changes, computeApplicationState),
    );

    const reset = SubscriptionRef.set(ref, initialState);

    return { get, update, applicationState, reset };
  }),
);

export const incrementBuildNumber = (s: LocalState): LocalState => ({
  ...s,
  buildNumber: s.buildNumber + 1,
});

export const setBuildOverall =
  (overall: LocalState['buildState']['overall']) =>
  (s: LocalState): LocalState => ({
    ...s,
    buildState: { ...s.buildState, overall },
  });

export const setBuildJobState =
  (buildJob: ProcessState) =>
  (s: LocalState): LocalState => ({
    ...s,
    buildState: { ...s.buildState, buildJob },
  });

export const setDeployJobState =
  (deployJob: ProcessState) =>
  (s: LocalState): LocalState => ({
    ...s,
    buildState: { ...s.buildState, deployJob },
  });

export const setCleanState =
  (cleanState: ProcessState) =>
  (s: LocalState): LocalState => ({ ...s, cleanState });
