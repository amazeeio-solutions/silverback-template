import { ChildProcess, execFileSync, spawn } from 'child_process';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { createServer } from 'net';
import { tmpdir } from 'os';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { afterAll, beforeAll, expect, test } from 'vitest';

/**
 * Boots the published tarball, not the sources. Bundling and packaging break at
 * runtime - missing files in the tarball, unresolved paths, dynamic requires -
 * which the unit tests cannot see because they import from `src`.
 */

const packageRoot = join(fileURLToPath(new URL('.', import.meta.url)), '..');

let installDir: string;
let publisher: ChildProcess;
let baseUrl: string;

const getFreePort = async (): Promise<number> =>
  new Promise((resolve, reject) => {
    const server = createServer();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (address === null || typeof address === 'string') {
        reject(new Error('Could not determine a free port.'));
        return;
      }
      server.close(() => resolve(address.port));
    });
  });

const waitForServer = async (url: string): Promise<Response> => {
  const deadline = Date.now() + 60_000;
  let lastError: unknown = null;
  while (Date.now() < deadline) {
    try {
      return await fetch(url);
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  throw new Error(`Publisher did not start: ${String(lastError)}`);
};

beforeAll(async () => {
  for (const artifact of ['dist/cli.js', 'dist/ui/status.html']) {
    if (!existsSync(join(packageRoot, artifact))) {
      throw new Error(`Missing ${artifact}. Run "pnpm prep" first.`);
    }
  }

  installDir = mkdtempSync(join(tmpdir(), 'publisher-smoke-'));

  const packOutput = execFileSync(
    'npm',
    ['pack', '--pack-destination', installDir, '--silent'],
    { cwd: packageRoot, encoding: 'utf-8' },
  );
  const tarball = join(installDir, packOutput.trim().split('\n').pop()!);

  writeFileSync(
    join(installDir, 'package.json'),
    JSON.stringify({
      name: 'publisher-smoke',
      version: '0.0.0',
      private: true,
    }),
  );
  // Installed with npm, so that the tarball resolves its dependencies the way a
  // consumer would, instead of through the workspace.
  execFileSync('npm', ['install', tarball, '--no-audit', '--no-fund'], {
    cwd: installDir,
    encoding: 'utf-8',
  });

  const port = await getFreePort();
  baseUrl = `http://127.0.0.1:${port}`;
  writeFileSync(
    join(installDir, 'publisher.config.ts'),
    // No imports: ts-import compiles this file on its own.
    `export default {
      publisherPort: ${port},
      mode: 'local',
      databaseUrl: './publisher.sqlite',
      commands: {
        clean: 'true',
        build: { command: 'true' },
      },
    };
    `,
  );

  publisher = spawn(join(installDir, 'node_modules/.bin/publisher'), {
    cwd: installDir,
    stdio: 'inherit',
  });

  await waitForServer(`${baseUrl}/___status/status.html`);
}, 300_000);

afterAll(async () => {
  publisher?.kill('SIGINT');
  await new Promise((resolve) => setTimeout(resolve, 2_000));
  publisher?.kill('SIGKILL');
  if (installDir) {
    rmSync(installDir, { recursive: true, force: true });
  }
});

test('serves the built status UI', async () => {
  const response = await fetch(`${baseUrl}/___status/status.html`);
  expect(response.status).toBe(200);
  const body = await response.text();
  expect(body).toContain('id="root"');
  // The asset URLs carry the base the UI is built with.
  expect(body).toContain('/___status/assets/');
});

test('serves the build history API', async () => {
  const response = await fetch(`${baseUrl}/___status/history`);
  expect(response.status).toBe(200);
  expect(await response.json()).toBeInstanceOf(Array);
});
