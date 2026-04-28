import { spawn } from 'child_process';
import {
  Chunk,
  Context,
  Deferred,
  Effect,
  Layer,
  Option,
  Ref,
  Stream,
} from 'effect';
import stripAnsi from 'strip-ansi';

import { Output } from './Output';

type Result = {
  exitCode: number | null;
};

export type RunningProcess = {
  output: Stream.Stream<string>;
  result: Effect.Effect<Result>;
  kill: Effect.Effect<void>;
};

export class Runner extends Context.Tag('Runner')<
  Runner,
  {
    readonly run: (options: {
      command: string;
      outputTimeout?: number;
    }) => Effect.Effect<RunningProcess>;
  }
>() {}

const terminateProcess = (
  pid: number,
  signal: NodeJS.Signals,
  timeout: number,
): Promise<void> =>
  new Promise((resolve, reject) => {
    try {
      process.kill(-pid, signal);
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === 'ESRCH') {
        resolve();
        return;
      }
      reject(e);
      return;
    }
    const timer = setTimeout(() => {
      reject(new Error(`Timeout killing pid ${pid} with ${signal}`));
    }, timeout);
    const check = setInterval(() => {
      try {
        process.kill(-pid, 0);
      } catch {
        clearInterval(check);
        clearTimeout(timer);
        resolve();
      }
    }, 100);
  });

const killProcess = async (
  pid: number,
  command: string,
): Promise<NodeJS.Signals> => {
  const signals: Array<NodeJS.Signals> = ['SIGINT', 'SIGTERM', 'SIGKILL'];
  for (const signal of signals) {
    try {
      await terminateProcess(pid, signal, 5000);
      return signal;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ESRCH') {
        return signal;
      }
      console.log('An attempt to kill the process failed:', {
        command,
        signal,
        error,
      });
    }
  }
  throw new Error(`Failed to kill "${command}" process.`);
};

export const RunnerLive = Layer.effect(
  Runner,
  Effect.gen(function* () {
    const output = yield* Output;

    const run = (options: {
      command: string;
      outputTimeout?: number;
    }): Effect.Effect<RunningProcess> =>
      Effect.gen(function* () {
        yield* output.publish(`Starting command: "${options.command}"`, 'info');

        const resultDeferred = yield* Deferred.make<Result>();
        const outputChunks = yield* Ref.make<Array<string>>([]);
        const listeners = yield* Ref.make<Array<(chunk: string) => void>>([]);
        const killSignalRef = yield* Ref.make<NodeJS.Signals | null>(null);
        const killedRef = yield* Ref.make(false);

        const proc = spawn(`( ${options.command} ) 2>&1`, {
          shell: '/bin/sh',
          detached: true,
        });

        let outputTimeoutHandle: ReturnType<typeof setTimeout> | undefined;
        const setOutputTimeout = (stop = false): void => {
          clearTimeout(outputTimeoutHandle);
          if (stop || !options.outputTimeout) {
            return;
          }
          outputTimeoutHandle = setTimeout(() => {
            Effect.runFork(
              output.publish(
                `Killing command due to the output timeout (${options.outputTimeout}ms): "${options.command}"`,
                'warning',
              ),
            );
            doKill();
          }, options.outputTimeout);
        };

        setOutputTimeout();

        const emitChunk = (cleaned: string): void => {
          Ref.update(outputChunks, (chunks) => [...chunks, cleaned]).pipe(
            Effect.runSync,
          );
          const fns = Ref.get(listeners).pipe(Effect.runSync);
          for (const fn of fns) {
            fn(cleaned);
          }
          Effect.runFork(output.publish(cleaned));
        };

        proc.stdout?.on('data', (chunk: Buffer) => {
          setOutputTimeout();
          const string = stripAnsi(`${chunk}`);
          if (string.trim() === '') {
            return;
          }
          emitChunk(string.replace(/\n{2}$/, '\n'));
        });

        const doKill = (): void => {
          const killed = Ref.get(killedRef).pipe(Effect.runSync);
          if (killed || proc.pid === undefined) {
            return;
          }
          Ref.set(killedRef, true).pipe(Effect.runSync);
          Effect.runFork(
            output.publish(`Killing command: "${options.command}"`, 'info'),
          );
          killProcess(proc.pid, options.command)
            .then((signal) => {
              return Ref.set(killSignalRef, signal).pipe(Effect.runSync);
            })
            .catch((error) => {
              console.error(`Failed to kill "${options.command}":`, error);
            });
        };

        proc.on('exit', (code): void => {
          setOutputTimeout(true);
          const killSignal = Ref.get(killSignalRef).pipe(Effect.runSync);
          const severity = killSignal || code === 0 ? 'success' : 'error';
          const message = killSignal
            ? `Command killed with ${killSignal} signal: "${options.command}"`
            : code === 0
              ? `Command exited: "${options.command}"`
              : `Command exited with ${code}: "${options.command}"`;
          Effect.runFork(output.publish(message, severity));
          Deferred.succeed(resultDeferred, { exitCode: code }).pipe(
            Effect.runSync,
          );
          const fns = Ref.get(listeners).pipe(Effect.runSync);
          for (const fn of fns) {
            fn('__EOF__');
          }
        });

        const processOutput: Stream.Stream<string> = Stream.async((emit) => {
          const existing = Ref.get(outputChunks).pipe(Effect.runSync);
          if (existing.length > 0) {
            emit(Effect.succeed(Chunk.fromIterable(existing)));
          }
          const listener = (chunk: string): void => {
            if (chunk === '__EOF__') {
              emit(Effect.fail(Option.none()));
            } else {
              emit(Effect.succeed(Chunk.of(chunk)));
            }
          };
          Ref.update(listeners, (l) => [...l, listener]).pipe(Effect.runSync);
        });

        const result = Deferred.await(resultDeferred);

        const kill = Effect.promise(() => {
          if (proc.pid === undefined) {
            return Promise.resolve();
          }
          doKill();
          return new Promise<void>((resolve) => {
            proc.on('exit', () => resolve());
          });
        });

        return { output: processOutput, result, kill } satisfies RunningProcess;
      });

    return { run };
  }),
);
