import { ApplicationState } from '@amazeelabs/publisher-shared';
import { Context, Effect, Stream } from 'effect';

export class Core extends Context.Tag('Core')<
  Core,
  {
    readonly applicationState: Stream.Stream<ApplicationState>;
    readonly start: Effect.Effect<void>;
    readonly stop: Effect.Effect<void>;
    readonly build: Effect.Effect<void>;
    readonly clean: Effect.Effect<void>;
    readonly getBuildNumber: Effect.Effect<number>;
    readonly handleWorkflowStatus?: (
      status: string,
      workflowRunUrl: string,
    ) => Effect.Effect<void>;
  }
>() {}
