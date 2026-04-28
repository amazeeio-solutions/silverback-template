import { Context, Effect, Layer, Option, Ref } from 'effect';

import { RunningProcess } from './Runner';

export class ServeHandle extends Context.Tag('ServeHandle')<
  ServeHandle,
  {
    readonly processRef: Ref.Ref<Option.Option<RunningProcess>>;
  }
>() {}

export const ServeHandleLive = Layer.effect(
  ServeHandle,
  Effect.map(Ref.make<Option.Option<RunningProcess>>(Option.none()), (processRef) => ({
    processRef,
  })),
);
