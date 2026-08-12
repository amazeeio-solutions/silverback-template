import { afterEach, expect, test, vi } from 'vitest';

import type { PublisherConfigLocal } from './config';

const inMemoryConfig: PublisherConfigLocal = {
  publisherPort: 3000,
  mode: 'local',
  commands: {
    clean: 'echo "clean"',
    build: { command: 'echo "build"' },
  },
  // Sequelize expects the literal ":memory:" storage path, not a sqlite:// URL.
  databaseUrl: ':memory:',
};

const importDatabaseWithConfig = async (): Promise<
  typeof import('./database')
> => {
  vi.resetModules();
  const { setConfig } = await import('./config');
  setConfig({ ...inMemoryConfig });
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
});

test('initDatabase creates the Build table in a real sqlite database', async () => {
  const { getDatabase, initDatabase } = await importDatabaseWithConfig();

  await initDatabase();
  const { Build } = await getDatabase();

  const tables = await Build.sequelize!.getQueryInterface().showAllTables();
  expect(tables).toContain('Builds');

  const columns = (await Build.describe()) as Record<string, { type: string }>;
  expect(Object.keys(columns).sort()).toStrictEqual([
    'createdAt',
    'finishedAt',
    'id',
    'logs',
    'startedAt',
    'success',
    'type',
    'updatedAt',
  ]);
  expect(columns.startedAt?.type).toBe('BIGINT');
  expect(columns.finishedAt?.type).toBe('BIGINT');
  expect(columns.success?.type).toBe('TINYINT(1)');
  expect(columns.type?.type).toBe('VARCHAR(255)');
  expect(columns.logs?.type).toBe('TEXT');

  await Build.sequelize!.close();
});

test('saveBuildInfo persists a record that can be read back with all fields intact', async () => {
  const { getDatabase, initDatabase, saveBuildInfo } =
    await importDatabaseWithConfig();

  await initDatabase();
  await saveBuildInfo(buildRecord);

  const { Build } = await getDatabase();
  const all = await Build.findAll();
  expect(all).toHaveLength(1);

  const stored = await Build.findByPk(all[0]!.getDataValue('id'));
  expect(stored).not.toBeNull();
  expect(stored!.get('startedAt')).toBe(buildRecord.startedAt);
  expect(stored!.get('finishedAt')).toBe(buildRecord.finishedAt);
  expect(stored!.get('success')).toBe(true);
  expect(stored!.get('type')).toBe('incremental');
  expect(stored!.get('logs')).toBe(buildRecord.logs);

  expect(typeof stored!.get('startedAt')).toBe('number');
  expect(typeof stored!.get('finishedAt')).toBe('number');
  expect(typeof stored!.get('success')).toBe('boolean');

  await Build.sequelize!.close();
});

test('saveBuildInfo stores a failed build with success false', async () => {
  const { getDatabase, initDatabase, saveBuildInfo } =
    await importDatabaseWithConfig();

  await initDatabase();
  await saveBuildInfo({ ...buildRecord, success: false, type: 'full' });

  const { Build } = await getDatabase();
  const stored = await Build.findOne();
  expect(stored!.get('success')).toBe(false);
  expect(stored!.get('type')).toBe('full');

  await Build.sequelize!.close();
});

test('getDatabase initializes the database lazily', async () => {
  const { getDatabase, saveBuildInfo } = await importDatabaseWithConfig();

  await saveBuildInfo(buildRecord);

  const { Build } = await getDatabase();
  expect(await Build.count()).toBe(1);

  await Build.sequelize!.close();
});

test('getDatabase returns the same models on every call', async () => {
  const { getDatabase, initDatabase } = await importDatabaseWithConfig();

  await initDatabase();
  const first = await getDatabase();
  const second = await getDatabase();
  expect(first.Build).toBe(second.Build);

  await first.Build.sequelize!.close();
});

test('initDatabase throws when called twice', async () => {
  const { getDatabase, initDatabase } = await importDatabaseWithConfig();

  await initDatabase();
  await expect(initDatabase()).rejects.toThrow('Database already initialized.');

  const { Build } = await getDatabase();
  await Build.sequelize!.close();
});
