import sqlite3 from 'sqlite3';

import { BuildModel } from '../shared/exports';
import { getConfig } from './config';

// TODO: Drop the sqlite3 dependency in favour of the built-in node:sqlite once
// the project runs on Node 22.5 or newer. It reads the same file, so this needs
// no data migration.

/**
 * The schema and the timestamp format are the ones Sequelize created, so that
 * databases written by publisher 3.x keep working, and a rollback to 3.x can
 * still read what was written here.
 */
const createTable = `
  CREATE TABLE IF NOT EXISTS \`Builds\` (
    \`id\` INTEGER PRIMARY KEY AUTOINCREMENT,
    \`startedAt\` BIGINT,
    \`finishedAt\` BIGINT,
    \`success\` TINYINT(1),
    \`type\` VARCHAR(255),
    \`logs\` TEXT,
    \`createdAt\` DATETIME NOT NULL,
    \`updatedAt\` DATETIME NOT NULL
  )
`;

const sequelizeTimestamp = (date: Date): string =>
  `${date.toISOString().replace('T', ' ').replace('Z', '')} +00:00`;

type BuildRow = Omit<BuildModel, 'success'> & {
  success: number;
  createdAt: string;
  updatedAt: string;
};

export type Build = BuildModel & {
  createdAt: string;
  updatedAt: string;
};

const toBuild = ({ success, ...row }: BuildRow): Build => ({
  ...row,
  success: !!success,
});

let database: sqlite3.Database | null = null;

const run = (sql: string, parameters: Array<unknown> = []): Promise<void> =>
  new Promise((resolve, reject) => {
    database!.run(sql, parameters, (error) =>
      error ? reject(error) : resolve(),
    );
  });

const all = <T>(sql: string, parameters: Array<unknown> = []): Promise<T[]> =>
  new Promise((resolve, reject) => {
    database!.all(sql, parameters, (error, rows) =>
      error ? reject(error) : resolve(rows as T[]),
    );
  });

const open = (): Promise<sqlite3.Database> =>
  new Promise((resolve, reject) => {
    const opened = new sqlite3.Database(getConfig().databaseUrl, (error) =>
      error ? reject(error) : resolve(opened),
    );
  });

export const initDatabase = async (): Promise<void> => {
  if (database) {
    throw new Error('Database already initialized.');
  }
  database = await open();
  await run(createTable);
};

const ensureDatabase = async (): Promise<void> => {
  if (!database) {
    await initDatabase();
  }
};

export const saveBuildInfo = async (
  record: Omit<BuildModel, 'id'>,
): Promise<void> => {
  await ensureDatabase();
  const now = sequelizeTimestamp(new Date());
  await run(
    `INSERT INTO \`Builds\`
      (\`startedAt\`, \`finishedAt\`, \`success\`, \`type\`, \`logs\`, \`createdAt\`, \`updatedAt\`)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      record.startedAt,
      record.finishedAt,
      record.success ? 1 : 0,
      record.type,
      record.logs,
      now,
      now,
    ],
  );
};

export const listBuilds = async (): Promise<Array<Build>> => {
  await ensureDatabase();
  const rows = await all<BuildRow>('SELECT * FROM `Builds` ORDER BY `id` DESC');
  return rows.map(toBuild);
};

export const getBuild = async (id: string): Promise<Build | null> => {
  await ensureDatabase();
  const rows = await all<BuildRow>(
    'SELECT * FROM `Builds` WHERE `id` = ? LIMIT 1',
    [id],
  );
  const row = rows[0];
  return row ? toBuild(row) : null;
};

export const closeDatabase = async (): Promise<void> => {
  const opened = database;
  if (!opened) {
    return;
  }
  database = null;
  await new Promise<void>((resolve, reject) => {
    opened.close((error) => (error ? reject(error) : resolve()));
  });
};
