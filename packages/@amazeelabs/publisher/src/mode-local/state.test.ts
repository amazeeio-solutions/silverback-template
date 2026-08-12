import { expect, test } from 'vitest';

import { ApplicationState } from '../shared/exports';
import { state } from './state';

test('applicationState$ is fired only on changes', async () => {
  const states: Array<ApplicationState> = [];
  state.applicationState$.subscribe((state) => {
    states.push(state);
  });
  state.setBuildState('InProgress');
  state.setBuildJobState('InProgress');
  state.setBuildJobState('Success');
  state.setDeployJobState('InProgress');
  state.setDeployJobState('Success');
  state.setBuildState('Done');
  expect(states).toStrictEqual([
    ApplicationState.Updating,
    ApplicationState.Ready,
  ]);
});
