import { act, cleanup, render } from '@testing-library/react';
import React from 'react';
import { defer, Subject } from 'rxjs';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import SimpleLog from './SimpleLog';

const webSocketMock = vi.hoisted(() => vi.fn());

vi.mock('rxjs/webSocket', () => ({ webSocket: webSocketMock }));

let socket: Subject<string>;

beforeEach(() => {
  socket = new Subject<string>();
  // `retry` resubscribes to the source, so the current socket is resolved on
  // every subscription to allow simulating a reconnect.
  webSocketMock.mockImplementation(() => defer(() => socket));
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  webSocketMock.mockReset();
});

function logLinesOf(container: HTMLElement) {
  return Array.from(container.querySelectorAll('.simple-log > div')).map(
    (line) => line.textContent,
  );
}

test('starts with an empty log', () => {
  const { container } = render(<SimpleLog url="ws://localhost/logs" />);
  expect(container.querySelector('.simple-log')).not.toBeNull();
  expect(logLinesOf(container)).toEqual([]);
});

test('connects to the given url and reads the raw message data', () => {
  render(<SimpleLog url="ws://localhost/___status/logs" />);
  expect(webSocketMock).toHaveBeenCalledTimes(1);
  const config = webSocketMock.mock.calls[0]?.[0];
  expect(config.url).toBe('ws://localhost/___status/logs');
  expect(config.deserializer({ data: 'raw line' })).toBe('raw line');
});

test('appends every received message as its own line', () => {
  const { container } = render(<SimpleLog url="ws://localhost/logs" />);
  act(() => {
    socket.next('first');
    socket.next('second');
  });
  expect(logLinesOf(container)).toEqual(['first', 'second']);
});

test('turns urls inside a message into links', () => {
  const { container } = render(<SimpleLog url="ws://localhost/logs" />);
  act(() => {
    socket.next('see https://example.com/build for details');
  });
  const link = container.querySelector('a') as HTMLAnchorElement;
  expect(link.getAttribute('href')).toBe('https://example.com/build');
  expect(link.getAttribute('target')).toBe('_blank');
  expect(link.getAttribute('rel')).toBe('noopener noreferrer');
});

test('escapes html contained in a message', () => {
  const { container } = render(<SimpleLog url="ws://localhost/logs" />);
  act(() => {
    socket.next('<script>alert("x")</script>');
  });
  expect(container.querySelector('script')).toBeNull();
  expect(logLinesOf(container)).toEqual(['<script>alert("x")</script>']);
});

test('reports a lost connection', () => {
  const { container } = render(<SimpleLog url="ws://localhost/logs" />);
  act(() => {
    socket.next('before the outage');
    socket.error(new Error('boom'));
  });
  expect(logLinesOf(container)).toEqual([
    'before the outage',
    '[Connection lost. Trying to reconnect...]',
  ]);
});

test('clears the log and reports a restored connection after a retry', () => {
  const { container } = render(<SimpleLog url="ws://localhost/logs" />);
  act(() => {
    socket.next('before the outage');
    socket.error(new Error('boom'));
  });

  socket = new Subject<string>();
  act(() => {
    vi.advanceTimersByTime(5000);
  });
  act(() => {
    socket.next('after the outage');
  });

  expect(logLinesOf(container)).toEqual([
    '[Connection restored]',
    'after the outage',
  ]);
});

test('does not reconnect before the retry delay elapsed', () => {
  const { container } = render(<SimpleLog url="ws://localhost/logs" />);
  act(() => {
    socket.error(new Error('boom'));
  });

  socket = new Subject<string>();
  act(() => {
    vi.advanceTimersByTime(4999);
  });
  expect(socket.observed).toBe(false);

  act(() => {
    vi.advanceTimersByTime(1);
  });
  expect(socket.observed).toBe(true);
  expect(logLinesOf(container)).toEqual([
    '[Connection lost. Trying to reconnect...]',
  ]);
});

test('closes the connection when unmounted', () => {
  const { container, unmount } = render(
    <SimpleLog url="ws://localhost/logs" />,
  );
  act(() => {
    socket.next('a line');
  });
  expect(socket.observed).toBe(true);
  unmount();
  expect(socket.observed).toBe(false);
  expect(container.querySelector('.simple-log')).toBeNull();
});

test('reconnects when the url changes', () => {
  const { rerender } = render(<SimpleLog url="ws://localhost/logs" />);
  expect(socket.observed).toBe(true);

  const previousSocket = socket;
  socket = new Subject<string>();
  rerender(<SimpleLog url="ws://localhost/other" />);

  expect(previousSocket.observed).toBe(false);
  expect(webSocketMock).toHaveBeenCalledTimes(2);
  expect(webSocketMock.mock.calls[1]?.[0].url).toBe('ws://localhost/other');
});

test('emits demo messages without a websocket in storybook mode', () => {
  const { container } = render(<SimpleLog url="__storybook__" />);
  expect(webSocketMock).not.toHaveBeenCalled();

  act(() => {
    vi.advanceTimersByTime(2000);
  });
  expect(logLinesOf(container)).toEqual([
    'Message 1',
    'Message 2',
    'Message 3',
    'Message 4',
  ]);

  act(() => {
    vi.advanceTimersByTime(500);
  });
  const lines = logLinesOf(container);
  expect(lines[4]).toContain('long message with https://example.com link');
  expect(container.querySelector('a')?.getAttribute('href')).toBe(
    'https://example.com',
  );
});

test('stops the demo messages when unmounted', () => {
  const { container, unmount } = render(<SimpleLog url="__storybook__" />);
  act(() => {
    vi.advanceTimersByTime(500);
  });
  const linesBeforeUnmount = logLinesOf(container).length;
  unmount();
  act(() => {
    vi.advanceTimersByTime(5000);
  });
  expect(linesBeforeUnmount).toBe(1);
  expect(vi.getTimerCount()).toBe(0);
});
