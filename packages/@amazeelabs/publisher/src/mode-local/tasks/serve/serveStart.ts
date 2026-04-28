import { Deferred, Effect, Fiber, Option, Ref, Stream } from 'effect';

import { localConfig as getLocalConfig } from '../../../services/Config';
import { Output } from '../../../services/Output';
import { Runner } from '../../../services/Runner';
import { ServeHandle } from '../../../services/ServeHandle';

export const serveStartTask = Effect.gen(function* () {
    const runner = yield* Runner;
    const output = yield* Output;
    const { processRef } = yield* ServeHandle;
    const localConfig = yield* getLocalConfig;

    const serve = localConfig.commands.serve;
    if (!serve) {
      return true;
    }

    const current = yield* Ref.get(processRef);
    if (Option.isSome(current)) {
      return true;
    }

    const proc = yield* runner.run({ command: serve.command });
    yield* Ref.set(processRef, Option.some(proc));

    yield* Effect.fork(
      Effect.gen(function* () {
        yield* proc.result;
        yield* Ref.set(processRef, Option.none());
      }),
    );

    const readyDeferred = yield* Deferred.make<void>();

    const watchFiber = yield* Effect.fork(
      Stream.runForEach(proc.output, (chunk) =>
        Effect.gen(function* () {
          if (chunk.includes(serve.readyPattern)) {
            yield* Deferred.succeed(readyDeferred, void 0);
          }
        }),
      ),
    );

    const timeout = serve.readyTimeout;
    if (timeout) {
      const result = yield* Effect.race(
        Deferred.await(readyDeferred).pipe(
          Effect.map(() => 'ready' as const),
        ),
        Effect.sleep(timeout).pipe(Effect.map(() => 'timeout' as const)),
      );
      yield* Fiber.interrupt(watchFiber);
      if (result === 'timeout') {
        yield* output.publish(
          `Could not find the serve ready pattern in ${timeout}ms\n`,
          'warning',
        );
        return false;
      }
    } else {
      yield* Deferred.await(readyDeferred);
      yield* Fiber.interrupt(watchFiber);
    }

    return true;
  });
