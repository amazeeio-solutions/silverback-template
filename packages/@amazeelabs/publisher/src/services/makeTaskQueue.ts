import { Effect, Fiber, Ref } from 'effect';

export type TaskQueue = {
  readonly addAndRun: (task: Effect.Effect<unknown>) => Effect.Effect<void>;
  readonly clear: Effect.Effect<void>;
  readonly getPending: Effect.Effect<Array<Effect.Effect<unknown>>>;
  readonly addPending: (
    tasks: Array<Effect.Effect<unknown>>,
  ) => Effect.Effect<void>;
};

export const makeTaskQueue: Effect.Effect<TaskQueue> = Effect.gen(function* () {
  const queueRef = yield* Ref.make<Array<Effect.Effect<unknown>>>([]);
  const runningRef = yield* Ref.make(false);
  const fiberRef = yield* Ref.make<Fiber.Fiber<void> | null>(null);

  const processQueue: Effect.Effect<void> = Effect.gen(function* () {
    while (true) {
      const tasks = yield* Ref.get(queueRef);
      if (tasks.length === 0) {
        break;
      }
      const [task, ...rest] = tasks;
      yield* Ref.set(queueRef, rest);
      yield* task!;
    }
    yield* Ref.set(runningRef, false);
    yield* Ref.set(fiberRef, null);
  });

  const addAndRun = (task: Effect.Effect<unknown>) =>
    Effect.gen(function* () {
      yield* Ref.update(queueRef, (q) => [...q, task]);
      const shouldStart = yield* Ref.modify(runningRef, (running) => [
        !running,
        true,
      ]);
      if (shouldStart) {
        const fiber = yield* Effect.fork(processQueue);
        yield* Ref.set(fiberRef, fiber);
      }
    });

  const clear = Effect.gen(function* () {
    yield* Ref.set(queueRef, []);
    const fiber = yield* Ref.get(fiberRef);
    if (fiber) {
      yield* Fiber.interrupt(fiber);
      yield* Ref.set(fiberRef, null);
      yield* Ref.set(runningRef, false);
    }
  });

  const getPending = Ref.get(queueRef);

  const addPending = (tasks: Array<Effect.Effect<unknown>>) =>
    Ref.update(queueRef, (q) => [...q, ...tasks]);

  return { addAndRun, clear, getPending, addPending };
});
