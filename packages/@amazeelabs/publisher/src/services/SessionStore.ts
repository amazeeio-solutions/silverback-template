import crypto from 'crypto';
import { Context, Effect, Layer, Ref } from 'effect';

export type SessionData = {
  tokenString?: string;
  state?: string;
  createdAt: number;
};

export class SessionStore extends Context.Tag('SessionStore')<
  SessionStore,
  {
    readonly createSession: Effect.Effect<string>;
    readonly getSession: (id: string) => Effect.Effect<SessionData | undefined>;
    readonly setSession: (
      id: string,
      data: Partial<SessionData>,
    ) => Effect.Effect<void>;
    readonly destroySession: (id: string) => Effect.Effect<void>;
  }
>() {}

const SESSION_MAX_AGE_MS = 60 * 60 * 12 * 1000;

export const SessionStoreLive = Layer.effect(
  SessionStore,
  Effect.gen(function* () {
    const store = yield* Ref.make<Map<string, SessionData>>(new Map());

    const prune = Ref.update(store, (m) => {
      const now = Date.now();
      const pruned = new Map(m);
      for (const [key, session] of pruned) {
        if (now - session.createdAt > SESSION_MAX_AGE_MS) {
          pruned.delete(key);
        }
      }
      return pruned;
    });

    const createSession = Effect.gen(function* () {
      yield* prune;
      const id = crypto.randomBytes(32).toString('hex');
      yield* Ref.update(store, (m) => {
        const updated = new Map(m);
        updated.set(id, { createdAt: Date.now() });
        return updated;
      });
      return id;
    });

    const getSession = (id: string) =>
      Effect.map(Ref.get(store), (m) => m.get(id));

    const setSession = (id: string, data: Partial<SessionData>) =>
      Ref.update(store, (m) => {
        const existing = m.get(id);
        if (!existing) {
          return m;
        }
        const updated = new Map(m);
        updated.set(id, { ...existing, ...data });
        return updated;
      });

    const destroySession = (id: string) =>
      Ref.update(store, (m) => {
        const updated = new Map(m);
        updated.delete(id);
        return updated;
      });

    return { createSession, getSession, setSession, destroySession };
  }),
);
