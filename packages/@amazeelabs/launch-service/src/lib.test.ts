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
  /**
   * Helper function to clean up any process using a specific port
   */
  const cleanupProcess = async (port: number): Promise<void> => {
    try {
      const process = await findProcessByPort(port);
      if (process?.pid) {
        await killProcess(process.pid, port);
        // Wait for the port to be fully released
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error(`Failed to cleanup process on port ${port}:`, error);
    }
  };

  beforeEach(async () => {
    // Clean up any existing process on port 3000
    await cleanupProcess(3000);
  });

  afterEach(async () => {
    // Ensure cleanup happens even if test fails
    await cleanupProcess(3000);
  });

  it('should start a service', async () => {
    try {
      const result = await startService(
        'node ./src/test-server.js 3000',
        ['tcp:localhost:3000'],
        2000, // Increased timeout for reliability
        cwd,
      );
      expect(result).toBeUndefined();
      const process = await findProcessByPort(3000);
      expect(process).toBeDefined();
      expect(process?.dir).toBe(cwd);
    } catch (error) {
      console.error('Failed to start service:', error);
      throw error;
    }
  });

  it('returns an error if execution fails', async () => {
    const result = await startService(
      'node ./src/test-server.js 666',
      ['tcp:localhost:666'],
      1000,
      cwd,
    );

    expect(result).toBeDefined();
    expect(result).toMatchObject({
      command: 'node ./src/test-server.js 666',
      output: 'The port of the beast!\n',
    });
  });
});

describe('killProcess', () => {
  // Helper function to clean up processes on port 3001
  const cleanupPort3001 = async (): Promise<void> => {
    try {
      const process = await findProcessByPort(3001);
      if (process?.pid) {
        await killProcess(process.pid, 3001);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error('Failed to cleanup port 3001:', error);
    }
  };

  beforeEach<{ pid: number }>(async () => {
    // Clean up any existing process first
    await cleanupPort3001();

    // Start a fresh service
    try {
      const result = await startService(
        'node ./src/test-server.js 3001',
        ['tcp:localhost:3001'],
        1000,
        cwd,
      );
      expect(result).toBeUndefined();
    } catch (error) {
      console.error('Failed to start test server:', error);
      throw error;
    }
  });

  afterEach(async () => {
    // Clean up after the test
    await cleanupPort3001();
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
