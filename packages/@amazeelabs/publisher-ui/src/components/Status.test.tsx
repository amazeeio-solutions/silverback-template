import { ApplicationState } from '@amazeelabs/publisher-shared';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, expect, test } from 'vitest';

import Status from './Status';

const originalLocation = window.location;

function stubLocation(search: string) {
  const location = { ...originalLocation, search, href: originalLocation.href };
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: location,
  });
  return location;
}

beforeEach(() => {
  stubLocation('');
});

afterEach(() => {
  cleanup();
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: originalLocation,
  });
});

function progressBarOf(container: HTMLElement) {
  return container.querySelector('.h-\\[3px\\].w-full') as HTMLElement;
}

test('announces the starting state with a spinner and a progress bar', () => {
  const { container } = render(<Status status={ApplicationState.Starting} />);
  expect(screen.getByText('Starting...')).toBeDefined();
  expect(container.querySelector('#L9')).not.toBeNull();
  expect(progressBarOf(container).className).toContain('bg-yellow-500');
  expect(
    progressBarOf(container).querySelector('.animate-bounce'),
  ).not.toBeNull();
});

test('shows the in progress indicators while updating without a label', () => {
  const { container } = render(<Status status={ApplicationState.Updating} />);
  expect(container.querySelector('#L9')).not.toBeNull();
  expect(progressBarOf(container).className).toContain('bg-yellow-500');
  expect(screen.queryByText('Starting...')).toBeNull();
  expect(screen.queryByText('Ready!')).toBeNull();
  expect(screen.queryByText('Error!')).toBeNull();
});

test('announces the ready state with a tick and a green bar', () => {
  const { container } = render(<Status status={ApplicationState.Ready} />);
  expect(screen.getByText('Ready!')).toBeDefined();
  expect(container.querySelector('.tick-circle')).not.toBeNull();
  expect(container.querySelector('#L9')).toBeNull();
  expect(progressBarOf(container).className).toContain('bg-green-500');
  expect(progressBarOf(container).querySelector('.animate-bounce')).toBeNull();
});

test('announces the error state with a cross and a red bar', () => {
  const { container } = render(<Status status={ApplicationState.Error} />);
  expect(screen.getByText('Error!')).toBeDefined();
  expect(container.querySelector('.cross-circle')).not.toBeNull();
  expect(progressBarOf(container).className).toContain('bg-red-500');
});

test('renders no label, icon or bar colour for the fatal state', () => {
  const { container } = render(<Status status={ApplicationState.Fatal} />);
  expect(container.textContent).toBe('');
  expect(container.querySelector('svg')).toBeNull();
  const progressBar = progressBarOf(container);
  expect(progressBar.className).not.toContain('bg-yellow-500');
  expect(progressBar.className).not.toContain('bg-green-500');
  expect(progressBar.className).not.toContain('bg-red-500');
});

test('renders nothing but the empty frame for an unknown status', () => {
  const { container } = render(<Status status={null} />);
  expect(container.textContent).toBe('');
  expect(container.querySelector('svg')).toBeNull();
});

test('uses the tighter spacing while a build is in progress', () => {
  const { container } = render(<Status status={ApplicationState.Updating} />);
  expect(container.querySelector('.pt-32')).not.toBeNull();
  expect(container.querySelector('.pt-36')).toBeNull();
});

test('uses the wider spacing while no build is in progress', () => {
  const { container } = render(<Status status={ApplicationState.Ready} />);
  expect(container.querySelector('.pt-36')).not.toBeNull();
  expect(container.querySelector('.pt-32')).toBeNull();
});

test('redirects to the destination once the application is ready', () => {
  const location = stubLocation('?dest=/some/page');
  render(<Status status={ApplicationState.Ready} />);
  expect(location.href).toBe('/some/page');
});

test('does not redirect before the application is ready', () => {
  const location = stubLocation('?dest=/some/page');
  const { rerender } = render(<Status status={ApplicationState.Updating} />);
  expect(location.href).toBe(originalLocation.href);

  rerender(<Status status={ApplicationState.Ready} />);
  expect(location.href).toBe('/some/page');
});

test('does not redirect when no destination is given', () => {
  const location = stubLocation('');
  render(<Status status={ApplicationState.Ready} />);
  expect(location.href).toBe(originalLocation.href);
});
