import { Subject } from 'rxjs';
import { afterEach, expect, test, vi } from 'vitest';

import { createWebsocketUrl } from './status';

// The mock is hoisted above the imports, which keeps the module from opening a
// real websocket at import time.
vi.mock('rxjs/webSocket', () => ({
  webSocket: () => new Subject<unknown>(),
}));

const originalLocation = window.location;

function stubLocation(protocol: string, host: string) {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { ...originalLocation, protocol, host },
  });
}

afterEach(() => {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: originalLocation,
  });
});

test('websocket url uses the secure scheme on https pages', () => {
  stubLocation('https:', 'example.com');
  expect(createWebsocketUrl('/___status/updates')).toBe(
    'wss://example.com/___status/updates',
  );
});

test('websocket url uses the plain scheme on http pages', () => {
  stubLocation('http:', 'localhost:8000');
  expect(createWebsocketUrl('/___status/updates')).toBe(
    'ws://localhost:8000/___status/updates',
  );
});

test.each(['file:', 'ftp:', 'wss:'])(
  'websocket url falls back to the plain scheme for the %s protocol',
  (protocol) => {
    stubLocation(protocol, 'example.com');
    expect(createWebsocketUrl('/logs')).toBe('ws://example.com/logs');
  },
);

test('websocket url keeps the port of the current host', () => {
  stubLocation('https:', 'preview.example.com:8443');
  expect(createWebsocketUrl('/___status/logs')).toBe(
    'wss://preview.example.com:8443/___status/logs',
  );
});

test('websocket url appends the path verbatim', () => {
  stubLocation('http:', 'example.com');
  expect(createWebsocketUrl('')).toBe('ws://example.com');
  expect(createWebsocketUrl('/a/b?c=d')).toBe('ws://example.com/a/b?c=d');
});
