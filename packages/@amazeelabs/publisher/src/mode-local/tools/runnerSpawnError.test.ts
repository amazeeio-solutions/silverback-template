import { EventEmitter } from 'events';
import { beforeEach, expect, test, vi } from 'vitest';

import { OutputSubject } from '../../tools/output';
import { TaskController } from '../../tools/queue';
import { core } from '../core';
import { run } from './runner';

/**
 * A spawn can fail outright - EAGAIN or ENOMEM when the container is under
 * memory or process pressure. `ChildProcess` then emits 'error' and never emits
 * 'exit'.
 */
vi.mock('child_process', () => ({
  spawn: vi.fn(() => {
    const child = new EventEmitter() as EventEmitter & { pid?: number };
    child.pid = undefined;
    setTimeout(
      () => child.emit('error', new Error('spawn /bin/sh EAGAIN')),
      10,
    );
    return child;
  }),
}));

beforeEach(() => {
  core.output$ = new OutputSubject();
});

test('a process that fails to spawn resolves instead of hanging the queue', async () => {
  const output: Array<string> = [];
  core.output$.subscribe((chunk) => output.push(chunk));

  const process = run({
    command: 'gatsby build',
    controller: new TaskController(),
  });

  // `result` only ever resolved on 'exit', so a failed spawn left the queue
  // waiting forever and the publisher stuck in "Starting".
  const result = await Promise.race([
    process.result,
    new Promise<'timeout'>((resolve) =>
      setTimeout(() => resolve('timeout'), 2000),
    ),
  ]);

  expect(result).not.toBe('timeout');
  expect(result).toStrictEqual({ exitCode: null });
  expect(output.join('')).toContain('spawn /bin/sh EAGAIN');
});
