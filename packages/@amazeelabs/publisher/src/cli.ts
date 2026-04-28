import { SqliteClient } from '@effect/sql-sqlite-node';
import { Effect, Layer, Stream } from 'effect';

import { startServer } from './server/index';
import { AppStateLive } from './services/AppState';
import { AuthLive } from './services/Auth';
import { Config, ConfigLive, PublisherConfig } from './services/Config';
import { Core } from './services/Core';
import { CoreGithubWorkflowLive } from './services/CoreGithubWorkflow';
import { CoreLocalLive } from './services/CoreLocal';
import { DatabaseLive } from './services/Database';
import { NotifierLive } from './services/Notifier';
import { Output, OutputLive } from './services/Output';
import { RunnerLive } from './services/Runner';
import { ServeHandleLive } from './services/ServeHandle';
import { SessionStoreLive } from './services/SessionStore';

const command = process.argv[2];

switch (command) {
  case undefined: {
    const program = Effect.gen(function* () {
      const output = yield* Output;
      const core = yield* Core;

      yield* Effect.fork(
        Stream.runForEach(output.stream, (chunk) =>
          Effect.sync(() => process.stdout.write(chunk)),
        ),
      );

      const { terminate } = yield* startServer;
      yield* core.start;

      yield* Effect.async<void>(() => {
        process.on('SIGINT', () => {
          Effect.runPromise(
            Effect.gen(function* () {
              yield* terminate;
              yield* core.stop;
              process.exit();
            }),
          );
        });
      });
    });

    const selectCoreLayer = (config: PublisherConfig) =>
      config.mode === 'local' ? CoreLocalLive : CoreGithubWorkflowLive;

    const appLayer = Layer.unwrapEffect(
      Effect.gen(function* () {
        const { config } = yield* Config;

        const sqliteLayer = SqliteClient.layer({
          filename: config.databaseUrl,
        });
        const dbLayer = DatabaseLive.pipe(Layer.provide(sqliteLayer));
        const authLayer = AuthLive.pipe(Layer.provide(SessionStoreLive));

        const sharedDeps = Layer.mergeAll(
          ConfigLive,
          OutputLive,
          AppStateLive,
          RunnerLive.pipe(Layer.provide(OutputLive)),
          dbLayer,
          ServeHandleLive,
          SessionStoreLive,
        );

        const coreLayer = selectCoreLayer(config).pipe(
          Layer.provide(sharedDeps),
        );

        return Layer.mergeAll(
          sharedDeps,
          NotifierLive,
          authLayer,
          coreLayer,
        );
      }),
    );

    const fullLayer = appLayer.pipe(Layer.provide(ConfigLive));

    Effect.runPromise(
      program.pipe(Effect.provide(fullLayer)),
    ).catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
    break;
  }

  case 'help':
  case '--help':
    console.log(`Usage: pnpm publisher [command]

Available commands:

(no command): Start the server.
`);
    break;

  default:
    console.error(`Unknown command: ${command}`);
    process.exit(1);
}
