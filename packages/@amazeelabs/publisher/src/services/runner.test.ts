import { Chunk, Effect, Layer, Stream } from 'effect';
import { describe, expect, it } from 'vitest';

import { OutputLive } from './Output';
import { Runner, RunnerLive } from './Runner';

const testLayer = RunnerLive.pipe(Layer.provide(OutputLive));

const run = <A>(effect: Effect.Effect<A, never, Runner>) =>
  Effect.runPromise(effect.pipe(Effect.provide(testLayer)));

describe('Runner', () => {
  it('captures stdout', async () => {
    const chunks = await run(
      Effect.gen(function* () {
        const runner = yield* Runner;
        const proc = yield* runner.run({ command: 'echo hello' });
        const output = yield* Stream.runCollect(proc.output);
        const { exitCode } = yield* proc.result;
        return {
          output: Chunk.toArray(output).join(''),
          exitCode,
        };
      }),
    );
    expect(chunks.output).toContain('hello');
    expect(chunks.exitCode).toBe(0);
  });

  it('captures stderr (merged via 2>&1)', async () => {
    const chunks = await run(
      Effect.gen(function* () {
        const runner = yield* Runner;
        const proc = yield* runner.run({
          command: 'echo error_output >&2',
        });
        const output = yield* Stream.runCollect(proc.output);
        yield* proc.result;
        return Chunk.toArray(output).join('');
      }),
    );
    expect(chunks).toContain('error_output');
  });

  it('reports nonzero exit code', async () => {
    const result = await run(
      Effect.gen(function* () {
        const runner = yield* Runner;
        const proc = yield* runner.run({ command: 'exit 42' });
        return yield* proc.result;
      }),
    );
    expect(result.exitCode).toBe(42);
  });

  it('can kill a running process', async () => {
    const result = await run(
      Effect.gen(function* () {
        const runner = yield* Runner;
        const proc = yield* runner.run({
          command: 'sleep 60',
        });
        yield* Effect.sleep(200);
        yield* proc.kill;
        const { exitCode } = yield* proc.result;
        return exitCode;
      }),
    );
    expect(result).not.toBe(0);
  });

  it('kills process on output timeout', async () => {
    const result = await run(
      Effect.gen(function* () {
        const runner = yield* Runner;
        const proc = yield* runner.run({
          command: 'echo start; sleep 60',
          outputTimeout: 500,
        });
        const { exitCode } = yield* proc.result;
        return exitCode;
      }),
    );
    expect(result).not.toBe(0);
  }, 10000);
});
