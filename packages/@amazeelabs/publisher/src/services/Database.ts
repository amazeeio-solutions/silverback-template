import { BuildModel } from '@amazeelabs/publisher-shared';
import { SqlClient } from '@effect/sql';
import { SqliteClient } from '@effect/sql-sqlite-node';
import { Context, Effect, Layer } from 'effect';

export type BuildCreateModel = Omit<BuildModel, 'id'>;

export class Database extends Context.Tag('Database')<
  Database,
  {
    readonly saveBuild: (record: BuildCreateModel) => Effect.Effect<void>;
    readonly getBuilds: Effect.Effect<Array<BuildModel>>;
    readonly getBuild: (id: number) => Effect.Effect<BuildModel | null>;
  }
>() {}

export const DatabaseLive = Layer.effect(
  Database,
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;

    yield* sql`
      CREATE TABLE IF NOT EXISTS Builds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        startedAt INTEGER NOT NULL,
        finishedAt INTEGER NOT NULL,
        success INTEGER NOT NULL,
        type TEXT NOT NULL,
        logs TEXT NOT NULL
      )
    `.pipe(Effect.catchAll((e) => {
      console.error('Database init error:', e);
      return Effect.void;
    }));

    const saveBuild = (record: BuildCreateModel) =>
      sql`
        INSERT INTO Builds (startedAt, finishedAt, success, type, logs)
        VALUES (${record.startedAt}, ${record.finishedAt}, ${record.success ? 1 : 0}, ${record.type}, ${record.logs})
      `.pipe(
        Effect.asVoid,
        Effect.catchAll((e) => {
          console.error('Database saveBuild error:', e);
          return Effect.void;
        }),
      );

    const getBuilds: Effect.Effect<Array<BuildModel>> = sql<BuildModel>`
      SELECT id, startedAt, finishedAt, success, type, logs
      FROM Builds ORDER BY id DESC
    `.pipe(
      Effect.map((rows) =>
        [...rows].map((r) => ({ ...r, success: !!r.success })),
      ),
      Effect.catchAll((e) => {
        console.error('Database getBuilds error:', e);
        return Effect.succeed([] as Array<BuildModel>);
      }),
    );

    const getBuild = (id: number): Effect.Effect<BuildModel | null> =>
      sql<BuildModel>`
        SELECT id, startedAt, finishedAt, success, type, logs
        FROM Builds WHERE id = ${id}
      `.pipe(
        Effect.map((rows) => {
          const row = [...rows][0];
          return row ? { ...row, success: !!row.success } : null;
        }),
        Effect.catchAll((e) => {
          console.error('Database getBuild error:', e);
          return Effect.succeed(null as BuildModel | null);
        }),
      );

    return { saveBuild, getBuilds, getBuild };
  }),
);

export const DatabaseLiveLayer = (databaseUrl: string) =>
  DatabaseLive.pipe(
    Layer.provide(
      SqliteClient.layer({
        filename: databaseUrl,
      }),
    ),
  );
