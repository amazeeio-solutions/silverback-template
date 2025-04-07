import getPort from 'get-port';
import { createServer, Server } from 'http';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { findProcessByPort, killProcess, startService } from './lib';

const cwd = path.join(__dirname, '..');

const server = () =>
  createServer((req, res) => {
    if (req.url === '/') {
      res.statusCode = 200;
      res.end('Hello, world!');
    } else if (req.url === '/home') {
      res.statusCode = 200;
      res.end('Hello, world!');
    } else {
      res.statusCode = 404;
      res.end('Not found');
    }
  });

describe('findProcessByPort', () => {
  beforeEach<{ port: number; server: Server }>(async (context) => {
    context.server = server();
    context.port = await getPort();
    context.server.listen(context.port, 'localhost');
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  afterEach<{ server: Server }>(async (context) => {
    context.server.close();
  });

  it<{
    port: number;
  }>('should return undefined if the port is not in use', async (ctx) => {
    expect(await findProcessByPort(ctx.port + 1)).toBeUndefined();
  });

  it<{
    port: number;
  }>('should return the pid and working directory', async (ctx) => {
    const result = await findProcessByPort(ctx.port);
    expect(result).toBeDefined();
    expect(result?.dir).toBe(process.cwd());
    expect(result?.pid).toBe(process.pid);
  });
});

describe('startService', () => {
  it('should start a service', async () => {
    const result = await startService(
      'node ./src/test-server.js 3000',
      ['tcp:localhost:3000'],
      1000,
      cwd,
    );
    expect(result).toBeUndefined();
    const process = await findProcessByPort(3000);
    expect(process).toBeDefined();
    expect(process?.dir).toBe(cwd);
  });

  it('returns an error if execution fails', async () => {
    const result = await startService(
      'node ./src/test-server.js 666',
      ['tcp:localhost:666'],
      1000,
      cwd,
    );
    expect(result).toBeDefined();
    expect(result?.command).toBe('node ./src/test-server.js 666');
    expect(result?.output).toContain('The port of the beast!');
  });
});

describe('killProcess', () => {
  beforeEach<{ pid: number }>(async () => {
    const result = await startService(
      'node ./src/test-server.js 3001',
      ['tcp:localhost:3001'],
      1000,
      cwd,
    );
    expect(result).toBeUndefined();
  });

  it<{ pid: number }>('should kill a process', async () => {
    const process = await findProcessByPort(3001);
    expect(process).toBeDefined();
    expect(process?.dir).toBe(cwd);
    expect(process?.pid).toBeDefined();
    if (process?.pid) {
      await killProcess(process.pid, 3001);
    }
    expect(await findProcessByPort(3001)).toBeUndefined();
  });
});
