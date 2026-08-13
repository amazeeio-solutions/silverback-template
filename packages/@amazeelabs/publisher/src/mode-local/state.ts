import { distinctUntilChanged, Observable } from 'rxjs';
import { createStore } from 'zustand/vanilla';

import { ApplicationState } from '../shared/exports';

type ProcessState = 'NotStarted' | 'InProgress' | 'Success' | 'Error';

type State = {
  buildNumber: number;
  buildState: {
    buildJob: ProcessState;
    deployJob: ProcessState;
    overall: 'NotStarted' | 'InProgress' | 'Done';
  };
  cleanState: ProcessState;
};

const initialState: State = {
  buildNumber: 0,
  buildState: {
    buildJob: 'NotStarted',
    deployJob: 'NotStarted',
    overall: 'NotStarted',
  },
  cleanState: 'NotStarted',
};

const store = createStore<State>(() => initialState);

export const state = {
  getBuildNumber: (): number => store.getState().buildNumber,

  setBuildNumber: (buildNumber: number): void => {
    store.setState({ buildNumber });
  },

  // Subscribers derive the application state from the whole store, so a build
  // transition has to be a single update. Two updates expose an intermediate
  // state that mixes the new build number with the previous build results.
  startBuild: (): void => {
    store.setState((currentState) => ({
      buildNumber: currentState.buildNumber + 1,
      buildState: {
        buildJob: 'NotStarted',
        deployJob: 'NotStarted',
        overall: 'InProgress',
      },
    }));
  },

  finishBuild: (): void => {
    store.setState((currentState) => ({
      buildState: { ...currentState.buildState, overall: 'Done' },
    }));
  },

  // Cancelled jobs report themselves as failed, but a build nobody waited for
  // has no outcome. Committing those results would report a failure the user
  // caused on purpose by cleaning or restarting.
  cancelBuild: (): void => {
    store.setState({
      buildState: {
        buildJob: 'NotStarted',
        deployJob: 'NotStarted',
        overall: 'NotStarted',
      },
    });
  },

  getBuildJobState: (): State['buildState']['buildJob'] =>
    store.getState().buildState.buildJob,

  setBuildJobState: (state: State['buildState']['buildJob']): void => {
    store.setState((currentState) => ({
      buildState: { ...currentState.buildState, buildJob: state },
    }));
  },

  getDeployJobState: (): State['buildState']['deployJob'] =>
    store.getState().buildState.deployJob,

  setDeployJobState: (state: State['buildState']['deployJob']): void => {
    store.setState((currentState) => ({
      buildState: { ...currentState.buildState, deployJob: state },
    }));
  },

  setCleanState: (state: State['cleanState']): void => {
    store.setState({ cleanState: state });
  },

  applicationState$: new Observable<ApplicationState>((subscriber) => {
    const unsubscribe = store.subscribe((state) =>
      subscriber.next(computeApplicationState(state)),
    );
    return (): void => unsubscribe();
  }).pipe(distinctUntilChanged()),

  reset: (): void => store.setState(initialState),
};

const computeApplicationState = ({
  buildState: { buildJob, deployJob, overall: buildOverall },
  cleanState: cleanJob,
  buildNumber,
}: State): ApplicationState => {
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
