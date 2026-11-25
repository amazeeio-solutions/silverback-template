import { Server } from 'http';
import { createRequire } from 'module';
import { AddressInfo } from 'net';
import { beforeEach, expect, test, vi } from 'vitest';

import { createApp } from './server';
import { clearConfig, PublisherConfigLocal, setConfig } from './tools/config';

vi.mock('./tools/database');

// `./tools/core` resolves the mode with `getConfig()` on module level, which
// happens before any test is able to provide a configuration.
vi.mock('./tools/core', async () => {
  const { BehaviorSubject, Subject } = await import('rxjs');
  const { OutputSubject } = await import('./tools/output');
  return {
    core: {
      state: {
        applicationState$: new Subject(),
        workflowState$: new BehaviorSubject('unknown'),
        workflowRunUrl: '',
      },
      output$: new OutputSubject(),
      start: vi.fn(),
      stop: vi.fn(),
      build: vi.fn(),
      clean: vi.fn(),
      getBuildNumber: vi.fn(() => 0),
    },
  };
});

// `ws` is a transitive dependency of `express-ws`, so it is resolved through
// the `express-ws` module rather than the package root.
const wsRequire = createRequire(
  createRequire(import.meta.url).resolve('express-ws'),
);

type WebSocketClient = {
  on(
    event: 'open' | 'close' | 'error',
    listener: (...args: Array<never>) => void,
  ): void;
  _socket: { write(data: Buffer): void };
  send(data: Buffer): void;
  terminate(): void;
  close(): void;
};

const WebSocketClient = wsRequire('ws') as new (
  address: string,
  options?: { headers?: Record<string, string> },
) => WebSocketClient;

const configWithoutServe: PublisherConfigLocal = {
  mode: 'local',
  publisherPort: 3000,
  databaseUrl: ':memory:',
  commands: {
    clean: 'echo "clean"',
    build: { command: 'echo "build"' },
  },
};

const listen = (app: ReturnType<typeof createApp>): Promise<Server> =>
  new Promise((resolve) => {
    const server = app.listen(0, '127.0.0.1', () =>
      resolve(server as unknown as Server),
    );
  });

const close = (server: Server): Promise<void> =>
  new Promise((resolve, reject) => {
    server.closeAllConnections();
    server.close((error) => (error ? reject(error) : resolve()));
  });

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const onceOpen = (client: WebSocketClient): Promise<void> =>
  new Promise((resolve, reject) => {
    client.on('open', () => resolve());
    client.on('error', reject);
  });

const staysConnected = (port: number, path: string): Promise<boolean> =>
  new Promise((resolve) => {
    const client = new WebSocketClient(`ws://127.0.0.1:${port}${path}`);
    let opened = false;
    client.on('open', () => {
      opened = true;
    });
    client.on('error', () => resolve(false));
    client.on('close', () => resolve(false));
    setTimeout(() => {
      client.terminate();
      resolve(opened);
    }, 250);
  });

beforeEach(() => {
  vi.stubEnv('PUBLISHER_SKIP_AUTHENTICATION', 'true');
  vi.clearAllMocks();
  clearConfig();
  setConfig(configWithoutServe);
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

test('a malformed frame does not crash the process', async () => {
  const server = await listen(createApp());
  const port = (server.address() as AddressInfo).port;

  // A crash surfaces as an uncaught exception. Record it instead of letting it
  // tear down the worker, and restore the original handlers afterwards.
  let uncaught: unknown;
  const record = (error: unknown): void => {
    uncaught = error;
  };
  const existingListeners = process.listeners('uncaughtException');
  process.removeAllListeners('uncaughtException');
  process.on('uncaughtException', record);

  try {
    const client = new WebSocketClient(
      `ws://127.0.0.1:${port}/___status/changes`,
    );
    await onceOpen(client);

    // A frame with a reserved opcode makes `ws` emit an 'error' event on the
    // server socket. Without an 'error' handler node rethrows it as an uncaught
    // exception and the process dies.
    client._socket.write(Buffer.from([0x83, 0x00]));
    await delay(300);
    client.terminate();

    expect(uncaught).toBeUndefined();
    // The server survived and still accepts connections.
    expect(await staysConnected(port, '/___status/changes')).toBe(true);
  } finally {
    process.removeListener('uncaughtException', record);
    existingListeners.forEach((listener) =>
      process.on('uncaughtException', listener),
    );
    await close(server);
  }
});

test('an oversized frame is refused instead of being buffered', async () => {
  // `ws` defaults to a 100 MB maxPayload and buffers a message until it is
  // complete, so unauthenticated sockets could each pin 100 MB of heap.
  const server = await listen(createApp());
  const port = (server.address() as AddressInfo).port;

  try {
    const client = new WebSocketClient(
      `ws://127.0.0.1:${port}/___status/changes`,
    );
    await onceOpen(client);

    const closeCode = await new Promise<number>((resolve) => {
      client.on('close', (code: number) => resolve(code));
      client.send(Buffer.alloc(256 * 1024, 0x61));
      setTimeout(() => resolve(0), 1000);
    });
    client.terminate();

    // 1009 is "message too big".
    expect(closeCode).toBe(1009);
  } finally {
    await close(server);
  }
});
