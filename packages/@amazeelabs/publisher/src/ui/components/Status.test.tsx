import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, expect, test } from 'vitest';

import { ApplicationState } from '../../shared/exports';
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
  expect(progressBarOf(container).className).toContain('bg-accent');
  expect(
    progressBarOf(container).querySelector('.animate-bounce'),
  ).not.toBeNull();
});

test('shows the in progress indicators while updating without a label', () => {
  const { container } = render(<Status status={ApplicationState.Updating} />);
  expect(container.querySelector('#L9')).not.toBeNull();
  expect(progressBarOf(container).className).toContain('bg-accent');
  expect(screen.queryByText('Starting...')).toBeNull();
  expect(screen.queryByText('Ready!')).toBeNull();
  expect(screen.queryByText('Error!')).toBeNull();
});

test('announces the ready state with a tick and a success bar', () => {
  const { container } = render(<Status status={ApplicationState.Ready} />);
  expect(screen.getByText('Ready!')).toBeDefined();
  expect(container.querySelector('.tick-circle')).not.toBeNull();
  expect(container.querySelector('#L9')).toBeNull();
  expect(progressBarOf(container).className).toContain('bg-success');
  expect(progressBarOf(container).querySelector('.animate-bounce')).toBeNull();
});

test('announces the error state with a cross and an error bar', () => {
  const { container } = render(<Status status={ApplicationState.Error} />);
  expect(screen.getByText('Error!')).toBeDefined();
  expect(container.querySelector('.cross-circle')).not.toBeNull();
  expect(progressBarOf(container).className).toContain('bg-error');
});

test('renders no label, icon or bar colour for the fatal state', () => {
  const { container } = render(<Status status={ApplicationState.Fatal} />);
  expect(container.textContent).toBe('');
  expect(container.querySelector('[data-status-icon] svg')).toBeNull();
  const progressBar = progressBarOf(container);
  expect(progressBar.className).not.toContain('bg-accent');
  expect(progressBar.className).not.toContain('bg-success');
  expect(progressBar.className).not.toContain('bg-error');
});

test('renders nothing but the empty frame for an unknown status', () => {
  const { container } = render(<Status status={null} />);
  expect(container.textContent).toBe('');
  expect(container.querySelector('[data-status-icon] svg')).toBeNull();
});

test.each([
  ApplicationState.Starting,
  ApplicationState.Updating,
  ApplicationState.Ready,
  ApplicationState.Error,
  ApplicationState.Fatal,
])('reserves the icon slot in the %s state so the label never shifts', (state) => {
  const { container } = render(<Status status={state} />);
  const slot = container.querySelector('[data-status-icon]');
  expect(slot).not.toBeNull();
  expect(slot!.className).toContain('h-20');
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

test('ignores a javascript: destination', () => {
  const location = stubLocation('?dest=javascript:alert(1)');
  render(<Status status={ApplicationState.Ready} />);
  expect(location.href).toBe(originalLocation.href);
});

test('ignores a cross-origin destination', () => {
  const location = stubLocation('?dest=https://evil.example/steal');
  render(<Status status={ApplicationState.Ready} />);
  expect(location.href).toBe(originalLocation.href);
});

test('follows an absolute destination on the current origin', () => {
  const location = stubLocation(`?dest=${originalLocation.origin}/some/page`);
  render(<Status status={ApplicationState.Ready} />);
  expect(location.href).toBe('/some/page');
});
