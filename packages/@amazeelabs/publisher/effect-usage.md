# Effect APIs Used in Publisher

Ordered from most to least commonly used.

## Effect (core)

| API | Count | Purpose |
|---|---|---|
| `Effect.gen` | 72 | Generator-based effect composition - used in every service, task, and test |
| `Effect.runPromise` | 21 | Bridge Effect to Promise at server route handlers and test runners |
| `Effect.sync` | 13 | Wrap synchronous side effects (pushing to arrays, checking WebSocket state) |
| `Effect.succeed` | 13 | Lift pure values into Effect (mock service implementations in tests) |
| `Effect.provide` | 11 | Inject service layers into effects (task queue context injection) |
| `Effect.fork` | 11 | Spawn background fibers (log streaming, state monitoring, output collection) |
| `Effect.void` | 11 | No-op effect used as return value in mocks and void operations |
| `Effect.runFork` | 10 | Run effects as fire-and-forget fibers from Node.js callbacks |
| `Effect.runSync` | 13 | Synchronous execution inside Node.js event callbacks (Runner process events) |
| `Effect.sleep` | 9 | Delays for polling, timeouts, and test timing |
| `Effect.map` | 7 | Transform effect results (DB row mapping, state derivation) |
| `Effect.tryPromise` | 6 | Wrap Promise-returning calls with error handling (gh CLI, OAuth2) |
| `Effect.option` | 6 | Convert failed effects to `Option.None` (retry-then-check pattern) |
| `Effect.fail` | 6 | Signal expected failures (non-zero exit code, Stream.async EOF) |
| `Effect.promise` | 5 | Wrap trusted Promises that won't reject (fetch, OAuth2 token) |
| `Effect.async` | 3 | Wrap callback-based APIs (server.listen, process events, SIGINT handler) |
| `Effect.race` | 2 | First-to-complete wins (workflow timeout, serve ready timeout) |
| `Effect.scoped` | 2 | Provide scope for resource cleanup (build task log collection) |
| `Effect.catchAll` | 2 | Recover from all expected errors (DB operations) |
| `Effect.asVoid` | 2 | Discard effect result |
| `Effect.retry` | 2 | Retry with schedule (build and deploy commands) |
| `Effect.tap` | 1 | Side-effect without changing result (logging in Auth) |
| `Effect.context` | 1 | Capture current service context (CoreLocal `provide` helper) |
| `Effect.try` | 1 | Wrap synchronous throwing code with error mapping (config loading) |
| `Effect.die` | 1 | Terminate with defect for impossible states (wrong config mode) |

## Ref (mutable cells)

| API | Count | Purpose |
|---|---|---|
| `Ref.make` | 20 | Create mutable references (process state, buffers, flags, counters) |
| `Ref.get` | 15 | Read current value |
| `Ref.set` | 12 | Replace current value |
| `Ref.update` | 10 | Modify value with function (append to buffer, update session map) |
| `Ref.modify` | 1 | Read + update atomically (task queue "should I start?" check) |
| `Ref.updateAndGet` | 1 | Update and return new value (build attempt counter) |

## Layer (dependency injection)

| API | Count | Purpose |
|---|---|---|
| `Layer.provide` | 19 | Wire dependencies between layers |
| `Layer.effect` | 11 | Create layer from effectful service construction (all `*Live` layers) |
| `Layer.mergeAll` | 8 | Combine independent layers (app composition, test layers) |
| `Layer.succeed` | 7 | Create layer from plain value (test mocks, `ConfigTest`) |
| `Layer.unwrapEffect` | 1 | Create config-dependent layer graph at startup (cli.ts) |

## Stream (async sequences)

| API | Count | Purpose |
|---|---|---|
| `Stream.runForEach` | 11 | Consume stream elements (log display, state monitoring, WebSocket push) |
| `Stream.fromQueue` | 4 | Convert PubSub subscription queue to stream |
| `Stream.unwrapScoped` | 3 | Create stream from scoped subscription (Output replay + live) |
| `Stream.concat` | 3 | Combine replay buffer with live stream |
| `Stream.fromIterable` | 3 | Stream from array (replay buffer) |
| `Stream.make` | 3 | Single-element stream (test mock output) |
| `Stream.empty` | 3 | No-output stream (test mocks) |
| `Stream.takeUntil` | 3 | Stop stream on condition (workflow success/failure, ready state) |
| `Stream.runCollect` | 2 | Collect all elements into Chunk (runner tests) |
| `Stream.fromPubSub` | 1 | Direct PubSub-to-Stream (applicationState in GH workflow) |
| `Stream.map` | 1 | Transform elements (LocalState to ApplicationState) |
| `Stream.changes` | 1 | Deduplicate consecutive values (application state transitions) |
| `Stream.take` | 1 | Take first N elements (test assertion) |
| `Stream.drop` | 1 | Skip first N elements (skip initial PubSub state) |
| `Stream.async` | 1 | Create stream from callback API (Runner process stdout) |

## Context (service definitions)

| API | Count | Purpose |
|---|---|---|
| `Context.Tag` | 10 | Define service identity (Core, AppState, Runner, Output, Config, Database, Auth, SessionStore, ServeHandle, Notifier) |

## Deferred (one-shot signals)

| API | Count | Purpose |
|---|---|---|
| `Deferred.make` | 4 | Create pending signal (process exit, workflow completion, serve ready) |
| `Deferred.succeed` | 3 | Complete signal with value |
| `Deferred.await` | 4 | Wait for signal completion |

## PubSub (fan-out messaging)

| API | Count | Purpose |
|---|---|---|
| `PubSub.unbounded` | 3 | Create unbounded pub/sub (output log, application state, workflow state) |
| `PubSub.publish` | 3 | Send message to all subscribers |
| `PubSub.subscribe` | 3 | Get a subscription queue (requires Scope) |

## Fiber (concurrency)

| API | Count | Purpose |
|---|---|---|
| `Fiber.await` | 4 | Wait for fiber completion (tests, joining forked work) |
| `Fiber.interrupt` | 3 | Cancel running fiber (WebSocket disconnect, task queue clear, log collection stop) |

## Option (nullable values)

| API | Count | Purpose |
|---|---|---|
| `Option.none` | 3 | Empty value (no running process, Stream.async EOF signal) |
| `Option.some` | 3 | Wrap present value (running serve process) |
| `Option.isSome` | 3 | Check if value present (serve process running?) |

## SubscriptionRef (observable state)

| API | Count | Purpose |
|---|---|---|
| `SubscriptionRef.make` | 1 | Create observable ref (AppState local state) |
| `SubscriptionRef.get` | 1 | Read current state |
| `SubscriptionRef.update` | 1 | Modify state with function |
| `SubscriptionRef.set` | 1 | Reset state |
| `.changes` | 1 | Stream of state changes (drives applicationState) |

## Schedule (retry/repeat)

| API | Count | Purpose |
|---|---|---|
| `Schedule.recurs` | 2 | Retry N times (build command 3 attempts, deploy command 3 attempts) |

## Chunk (immutable arrays)

| API | Count | Purpose |
|---|---|---|
| `Chunk.toArray` | 2 | Convert to JS array (test assertions) |
| `Chunk.of` | 1 | Single-element chunk (Stream.async emit) |
| `Chunk.fromIterable` | 1 | Chunk from array (Stream.async replay) |

## Data (structured types)

| API | Count | Purpose |
|---|---|---|
| `Data.TaggedError` | 1 | Define typed error class (ConfigError) |

## @effect/sql (database)

| API | Count | Purpose |
|---|---|---|
| `SqliteClient.layer` | 2 | Create SQLite connection layer (cli.ts, Database.ts) |
| `SqlClient.SqlClient` | 1 | Resolve SQL client in Database service |
| Template literal SQL | 4 | `sql\`SELECT ...\`` tagged template queries |
