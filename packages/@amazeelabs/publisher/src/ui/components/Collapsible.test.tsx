import { cleanup, render, screen, waitFor } from '@testing-library/react';
import React, { ComponentProps } from 'react';
import { afterEach, expect, test } from 'vitest';

import Collapsible from './Collapsible';

afterEach(cleanup);

const durations = { delay: 10, fadeDuration: 200, scaleDuration: 250 };
const panelText = 'panel content';

type CollapsibleProps = Omit<
  ComponentProps<typeof Collapsible>,
  'children' | keyof typeof durations
>;

function collapsible(props: CollapsibleProps) {
  return (
    <Collapsible {...durations} {...props}>
      <p>{panelText}</p>
    </Collapsible>
  );
}

function renderCollapsible(props: CollapsibleProps) {
  const result = render(collapsible(props));
  return {
    ...result,
    update: (next: CollapsibleProps) => result.rerender(collapsible(next)),
    fadeWrapper: () => result.container.firstElementChild as HTMLElement,
    heightWrapper: () =>
      result.container.firstElementChild?.firstElementChild as HTMLElement,
  };
}

test('shows the content while expanded', () => {
  renderCollapsible({ show: true });
  expect(screen.getByText(panelText)).toBeDefined();
});

test('removes the content while collapsed', () => {
  renderCollapsible({ show: false });
  expect(screen.queryByText(panelText)).toBeNull();
});

test('toggles the content when the show flag changes', async () => {
  const { update } = renderCollapsible({ show: false });
  expect(screen.queryByText(panelText)).toBeNull();

  update({ show: true });
  expect(screen.getByText(panelText)).toBeDefined();

  update({ show: false });
  // The content is unmounted only once the leave transition finished.
  await waitFor(() => expect(screen.queryByText(panelText)).toBeNull());
});

test('fades the wrapper in when expanded', () => {
  const { fadeWrapper } = renderCollapsible({ show: true });
  expect(fadeWrapper().style.opacity).toBe('1');
  expect(fadeWrapper().style.transitionProperty).toBe('opacity');
  expect(fadeWrapper().style.transitionDuration).toBe('200ms');
});

test('fades the wrapper out when collapsed', () => {
  const { fadeWrapper } = renderCollapsible({ show: false });
  expect(fadeWrapper().style.opacity).toBe('0');
});

test('delays the fade until the height animation finished when expanding', () => {
  const { fadeWrapper } = renderCollapsible({ show: true });
  expect(fadeWrapper().style.transitionDelay).toBe('260ms');
});

test('starts the fade immediately when collapsing', () => {
  const { fadeWrapper } = renderCollapsible({ show: false });
  expect(fadeWrapper().style.transitionDelay).toBe('10ms');
});

test('animates the height with the scale duration', () => {
  const { heightWrapper } = renderCollapsible({ show: true });
  expect(heightWrapper().style.transitionProperty).toBe('height');
  expect(heightWrapper().style.transitionDuration).toBe('250ms');
  expect(heightWrapper().style.transitionDelay).toBe('10ms');
});

test('delays the height animation until the fade out finished when collapsing', () => {
  const { heightWrapper, update } = renderCollapsible({ show: true });
  update({ show: false });
  expect(heightWrapper().style.transitionDelay).toBe('210ms');
});

test('expands the height wrapper to its natural height after entering', async () => {
  const { heightWrapper, update } = renderCollapsible({ show: false });
  update({ show: true });
  await waitFor(() => expect(heightWrapper().style.height).toBe('auto'));
});

test('reports the transition phases to the lifecycle callbacks', async () => {
  const calls: Array<string> = [];
  const callbacks = {
    beforeEnter: () => calls.push('beforeEnter'),
    afterEnter: () => calls.push('afterEnter'),
    beforeLeave: () => calls.push('beforeLeave'),
    afterLeave: () => calls.push('afterLeave'),
  };
  const { update } = renderCollapsible({ show: false, ...callbacks });
  expect(calls).toEqual([]);

  update({ show: true, ...callbacks });
  await waitFor(() => expect(calls).toEqual(['beforeEnter', 'afterEnter']));

  update({ show: false, ...callbacks });
  await waitFor(() =>
    expect(calls).toEqual([
      'beforeEnter',
      'afterEnter',
      'beforeLeave',
      'afterLeave',
    ]),
  );
});
