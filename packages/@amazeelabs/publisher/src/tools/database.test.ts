import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import sqlite3 from 'sqlite3';
import { afterEach, expect, test, vi } from 'vitest';

import type { PublisherConfigLocal } from './config';

const temporaryDirectories: Array<string> = [];

const configFor = (databaseUrl: string): PublisherConfigLocal => ({
  publisherPort: 3000,
  mode: 'local',
  commands: {
    clean: 'echo "clean"',
    build: { command: 'echo "build"' },
  },
  databaseUrl,
});

const temporaryDatabasePath = (): string => {
  const directory = mkdtempSync(join(tmpdir(), 'publisher-database-'));
  temporaryDirectories.push(directory);
  return join(directory, 'publisher.sqlite');
};

const importDatabaseWithConfig = async (
  databaseUrl = ':memory:',
): Promise<typeof import('./database')> => {
  vi.resetModules();
  const { setConfig } = await import('./config');
  setConfig(configFor(databaseUrl));
  return import('./database');
};

const buildRecord = {
  startedAt: 1739000000000,
  finishedAt: 1739000060000,
  success: true,
  type: 'incremental' as const,
  logs: 'build started\nbuild done',
};

afterEach(() => {
  vi.resetModules();
  while (temporaryDirectories.length) {
    rmSync(temporaryDirectories.pop()!, { recursive: true, force: true });
  }
});

const readColumns = (
  path: string,
): Promise<Array<{ name: string; type: string; notnull: number }>> =>
  new Promise((resolve, reject) => {
    const database = new sqlite3.Database(path);
    database.all('PRAGMA table_info(`Builds`)', (error, rows) => {
      database.close();
      return error
        ? reject(error)
        : resolve(
            rows as Array<{ name: string; type: string; notnull: number }>,
          );
    });
  });

test('initDatabase creates the Build table with the Sequelize schema', async () => {
  const path = temporaryDatabasePath();
  const { initDatabase, closeDatabase } = await importDatabaseWithConfig(path);

  await initDatabase();
  await closeDatabase();

  const columns = await readColumns(path);
  expect(columns.map((column) => column.name).sort()).toStrictEqual([
    'createdAt',
    'finishedAt',
    'id',
    'logs',
    'startedAt',
    'success',
    'type',
    'updatedAt',
  ]);
  const types = Object.fromEntries(
    columns.map((column) => [column.name, column.type]),
  );
  expect(types).toStrictEqual({
    id: 'INTEGER',
    startedAt: 'BIGINT',
    finishedAt: 'BIGINT',
    success: 'TINYINT(1)',
    type: 'VARCHAR(255)',
    logs: 'TEXT',
    createdAt: 'DATETIME',
    updatedAt: 'DATETIME',
  });
});

test('initDatabase leaves an existing database untouched', async () => {
  const path = temporaryDatabasePath();
  const first = await importDatabaseWithConfig(path);
  await first.initDatabase();
  await first.saveBuildInfo(buildRecord);
  await first.closeDatabase();

  const second = await importDatabaseWithConfig(path);
  await second.initDatabase();

  expect(await second.listBuilds()).toHaveLength(1);
  await second.closeDatabase();
});

test('saveBuildInfo persists a record that can be read back with all fields intact', async () => {
  const { initDatabase, saveBuildInfo, listBuilds, getBuild, closeDatabase } =
    await importDatabaseWithConfig();

  await initDatabase();
  await saveBuildInfo(buildRecord);

  const builds = await listBuilds();
  expect(builds).toHaveLength(1);

  const stored = await getBuild(String(builds[0]!.id));
  expect(stored).not.toBeNull();
  expect(stored!.startedAt).toBe(buildRecord.startedAt);
  expect(stored!.finishedAt).toBe(buildRecord.finishedAt);
  expect(stored!.success).toBe(true);
  expect(stored!.type).toBe('incremental');
  expect(stored!.logs).toBe(buildRecord.logs);

  expect(typeof stored!.startedAt).toBe('number');
  expect(typeof stored!.finishedAt).toBe('number');
  expect(typeof stored!.success).toBe('boolean');

  await closeDatabase();
});

test('saveBuildInfo timestamps records the way Sequelize did', async () => {
  const { initDatabase, saveBuildInfo, listBuilds, closeDatabase } =
    await importDatabaseWithConfig();

  await initDatabase();
  await saveBuildInfo(buildRecord);

  const [stored] = await listBuilds();
  expect(stored!.createdAt).toMatch(
    /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} \+00:00$/,
  );
  expect(stored!.updatedAt).toBe(stored!.createdAt);

  await closeDatabase();
});

test('saveBuildInfo stores a failed build with success false', async () => {
  const { initDatabase, saveBuildInfo, listBuilds, closeDatabase } =
    await importDatabaseWithConfig();

  await initDatabase();
  await saveBuildInfo({ ...buildRecord, success: false, type: 'full' });

  const [stored] = await listBuilds();
  expect(stored!.success).toBe(false);
  expect(stored!.type).toBe('full');

  await closeDatabase();
});

test('listBuilds returns the newest build first', async () => {
  const { initDatabase, saveBuildInfo, listBuilds, closeDatabase } =
    await importDatabaseWithConfig();

  await initDatabase();
  await saveBuildInfo({ ...buildRecord, logs: 'first' });
  await saveBuildInfo({ ...buildRecord, logs: 'second' });

  expect((await listBuilds()).map((build) => build.logs)).toStrictEqual([
    'second',
    'first',
  ]);

  await closeDatabase();
});

test('getBuild returns null for an unknown id', async () => {
  const { initDatabase, getBuild, closeDatabase } =
    await importDatabaseWithConfig();

  await initDatabase();

  expect(await getBuild('4242')).toBeNull();

  await closeDatabase();
});

test('the database is initialized lazily', async () => {
  const { saveBuildInfo, listBuilds, closeDatabase } =
    await importDatabaseWithConfig();

  await saveBuildInfo(buildRecord);

  expect(await listBuilds()).toHaveLength(1);

  await closeDatabase();
});

test('initDatabase throws when called twice', async () => {
  const { initDatabase, closeDatabase } = await importDatabaseWithConfig();

  await initDatabase();
  await expect(initDatabase()).rejects.toThrow('Database already initialized.');

  await closeDatabase();
});
