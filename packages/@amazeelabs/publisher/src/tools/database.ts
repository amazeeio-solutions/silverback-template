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

/** A build without its logs, which is all the history list renders. */
export type BuildSummary = Omit<Build, 'logs'>;

const toBuild = ({ success, ...row }: BuildRow): Build => ({
  ...row,
  success: !!success,
});

const toBuildSummary = ({
  success,
  ...row
}: Omit<BuildRow, 'logs'>): BuildSummary => ({
  ...row,
  success: !!success,
});

/**
 * The history list is capped and carries no logs, because the table grows with
 * every build and a single log can be megabytes. The detail view fetches the
 * logs of one build through getBuild().
 */
const buildListLimit = 50;

/** How many builds are kept. Older ones are deleted when a build is saved. */
export const buildRetentionLimit = 200;

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
  await pruneBuilds();
};

/**
 * Every row holds a build log, and on Lagoon the database lives on the
 * container's storage, so an unbounded table eventually gets the pod evicted.
 */
const pruneBuilds = (): Promise<void> =>
  run(
    `DELETE FROM \`Builds\` WHERE \`id\` NOT IN (
       SELECT \`id\` FROM \`Builds\` ORDER BY \`id\` DESC LIMIT ?
     )`,
    [buildRetentionLimit],
  );

/**
 * For callers that cannot await, such as rxjs subscribers and task callbacks. A
 * build that fails to persist is not worth exiting the process for, and an
 * unhandled rejection would do exactly that.
 */
export const saveBuildInfoSafely = (record: Omit<BuildModel, 'id'>): void => {
  saveBuildInfo(record).catch((error) => {
    console.error('Could not save the build info:', error);
  });
};

export const listBuilds = async (): Promise<Array<BuildSummary>> => {
  await ensureDatabase();
  const rows = await all<Omit<BuildRow, 'logs'>>(
    `SELECT \`id\`, \`startedAt\`, \`finishedAt\`, \`success\`, \`type\`,
       \`createdAt\`, \`updatedAt\`
     FROM \`Builds\` ORDER BY \`id\` DESC LIMIT ?`,
    [buildListLimit],
  );
  return rows.map(toBuildSummary);
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
