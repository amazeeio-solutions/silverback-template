import { Effect, Option, Ref } from 'effect';

import { ServeHandle } from '../../../services/ServeHandle';

export const serveStopTask = Effect.gen(function* () {
  const { processRef } = yield* ServeHandle;
  const current = yield* Ref.get(processRef);
  if (Option.isSome(current)) {
    yield* current.value.kill;
  }
});
