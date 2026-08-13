import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { installCrashGuards, installShutdownHandlers } from './lifecycle';

let existingRejectionListeners: Array<NodeJS.UnhandledRejectionListener> = [];
let existingExceptionListeners: Array<NodeJS.UncaughtExceptionListener> = [];

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  existingRejectionListeners = process.listeners('unhandledRejection');
  existingExceptionListeners = process.listeners('uncaughtException');
  process.removeAllListeners('unhandledRejection');
  process.removeAllListeners('uncaughtException');
});

afterEach(() => {
  process.removeAllListeners('unhandledRejection');
  process.removeAllListeners('uncaughtException');
  existingRejectionListeners.forEach((listener) =>
    process.on('unhandledRejection', listener),
  );
  existingExceptionListeners.forEach((listener) =>
    process.on('uncaughtException', listener),
  );
});

test('a rejection that nothing handles no longer terminates the process', () => {
  installCrashGuards();
  // Node terminates the process on an unhandled rejection unless a listener
  // takes responsibility for it.
  expect(process.listeners('unhandledRejection')).toHaveLength(1);
});

test('an exception that nothing catches no longer terminates the process', () => {
  installCrashGuards();
  expect(process.listeners('uncaughtException')).toHaveLength(1);
});

test('an unhandled rejection is reported and the process keeps serving', () => {
  const exit = vi
    .spyOn(process, 'exit')
    .mockImplementation(() => undefined as never);
  installCrashGuards();

  process.emit(
    'unhandledRejection',
    new Error('Slack is down'),
    Promise.resolve(),
  );

  expect(console.error).toHaveBeenCalledWith(
    'Unhandled promise rejection:',
    expect.objectContaining({ message: 'Slack is down' }),
  );
  expect(exit).not.toHaveBeenCalled();
  expect(process.exitCode).toBeUndefined();
});

test('an uncaught exception is reported and the process keeps serving', () => {
  const exit = vi
    .spyOn(process, 'exit')
    .mockImplementation(() => undefined as never);
  installCrashGuards();

  process.emit('uncaughtException', new Error('Malformed frame'));

  expect(console.error).toHaveBeenCalledWith(
    'Uncaught exception:',
    expect.objectContaining({ message: 'Malformed frame' }),
  );
  expect(exit).not.toHaveBeenCalled();
  expect(process.exitCode).toBeUndefined();
});

test('installing twice does not report the same failure twice', () => {
  installCrashGuards();
  installCrashGuards();

  process.emit('uncaughtException', new Error('Once'));

  expect(console.error).toHaveBeenCalledTimes(1);
});

const signals: Array<'SIGINT' | 'SIGTERM'> = ['SIGINT', 'SIGTERM'];

const withoutSignalListeners = async (
  body: () => Promise<void>,
): Promise<void> => {
  const existing = new Map(
    signals.map((signal) => [signal, process.listeners(signal)]),
  );
  signals.forEach((signal) => process.removeAllListeners(signal));
  try {
    await body();
  } finally {
    signals.forEach((signal) => {
      process.removeAllListeners(signal);
      existing
        .get(signal)!
        .forEach((listener) => process.on(signal, listener as () => void));
    });
  }
};

const settle = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, 50));

test.each(signals)('%s shuts the server down gracefully', async (signal) => {
  await withoutSignalListeners(async () => {
    const exit = vi
      .spyOn(process, 'exit')
      .mockImplementation(() => undefined as never);
    const shutdown = vi.fn(async () => {});

    installShutdownHandlers(shutdown);
    process.emit(signal);
    await settle();

    expect(shutdown).toHaveBeenCalledTimes(1);
    expect(exit).toHaveBeenCalled();
  });
});

test('repeated signals do not start a second shutdown', async () => {
  await withoutSignalListeners(async () => {
    vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    let resolveShutdown = (): void => {};
    const shutdown = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveShutdown = resolve;
        }),
    );

    installShutdownHandlers(shutdown);
    process.emit('SIGTERM');
    process.emit('SIGTERM');
    process.emit('SIGINT');
    await settle();

    expect(shutdown).toHaveBeenCalledTimes(1);
    resolveShutdown();
    await settle();
  });
});

test('a shutdown that fails still lets the process exit', async () => {
  await withoutSignalListeners(async () => {
    const exit = vi
      .spyOn(process, 'exit')
      .mockImplementation(() => undefined as never);
    const shutdown = vi.fn(() => Promise.reject(new Error('Terminator hung')));

    installShutdownHandlers(shutdown);
    process.emit('SIGTERM');
    await settle();

    expect(console.error).toHaveBeenCalledWith(
      'Shutdown failed:',
      expect.objectContaining({ message: 'Terminator hung' }),
    );
    expect(exit).toHaveBeenCalled();
  });
});
