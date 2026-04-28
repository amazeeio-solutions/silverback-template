import { Context, Effect, Layer, PubSub, Queue, Ref, Scope, Stream } from 'effect';

type Severity = 'info' | 'warning' | 'error' | 'success';

const prefix = (severity: Severity | undefined): string => {
  switch (severity) {
    case 'info':
      return 'ℹ️ ';
    case 'warning':
      return '⚠️ ';
    case 'error':
      return '❌ ';
    case 'success':
      return '✅ ';
    case undefined:
      return '';
  }
};

export const formatOutput = (value: string, severity?: Severity): string => {
  const formatted = `${prefix(severity)}${value}`;
  return formatted.endsWith('\n') ? formatted : formatted + '\n';
};

export class Output extends Context.Tag('Output')<
  Output,
  {
    readonly publish: (
      value: string,
      severity?: Severity,
    ) => Effect.Effect<void>;
    readonly stream: Stream.Stream<string>;
    readonly subscribe: Effect.Effect<Queue.Dequeue<string>, never, Scope.Scope>;
  }
>() {}

const REPLAY_BUFFER_SIZE = 500;

export const OutputLive = Layer.effect(
  Output,
  Effect.gen(function* () {
    const pubsub = yield* PubSub.unbounded<string>();
    const buffer = yield* Ref.make<Array<string>>([]);

    const publish = (value: string, severity?: Severity) =>
      Effect.gen(function* () {
        const formatted = formatOutput(value, severity);
        yield* Ref.update(buffer, (buf) =>
          [...buf, formatted].slice(-REPLAY_BUFFER_SIZE),
        );
        yield* PubSub.publish(pubsub, formatted);
      });

    const subscribe: Effect.Effect<Queue.Dequeue<string>, never, Scope.Scope> =
      PubSub.subscribe(pubsub);

    const stream: Stream.Stream<string> = Stream.unwrapScoped(
      Effect.gen(function* () {
        const queue = yield* PubSub.subscribe(pubsub);
        const replay = yield* Ref.get(buffer);
        return Stream.concat(
          Stream.fromIterable(replay),
          Stream.fromQueue(queue),
        );
      }),
    );

    return { publish, stream, subscribe };
  }),
);
