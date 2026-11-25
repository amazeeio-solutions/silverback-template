import { Subscription } from 'rxjs';
import { beforeEach, expect, test } from 'vitest';

import { ApplicationState } from '../shared/exports';
import { state } from './state';

let states: Array<ApplicationState> = [];
let stateSubscription: Subscription | null = null;

beforeEach(() => {
  state.reset();
  stateSubscription?.unsubscribe();
  stateSubscription = state.applicationState$.subscribe((state) => {
    states.push(state);
  });
  states = [];
});

test('applicationState$ is fired only on changes', async () => {
  state.startBuild();
  state.setBuildJobState('InProgress');
  state.setBuildJobState('Success');
  state.setDeployJobState('InProgress');
  state.setDeployJobState('Success');
  state.finishBuild();
  expect(states).toStrictEqual([
    ApplicationState.Starting,
    ApplicationState.Ready,
  ]);
});

test('startBuild() transitions in a single step', () => {
  state.startBuild();
  state.setBuildJobState('Error');
  state.finishBuild();

  state.startBuild();

  expect(states).toStrictEqual([
    ApplicationState.Starting,
    ApplicationState.Fatal,
    ApplicationState.Updating,
  ]);
});
