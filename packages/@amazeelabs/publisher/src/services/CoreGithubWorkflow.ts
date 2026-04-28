import { exec, spawn as spawnProcess } from 'node:child_process';
import { promisify } from 'node:util';

import {
  ApplicationState,
  WorkflowPublisherPayload,
} from '@amazeelabs/publisher-shared';
import { Deferred, Effect, Fiber, Layer, PubSub, Ref, Stream } from 'effect';

import { Config, PublisherConfigGithubWorkflow } from './Config';
import { Core } from './Core';
import { Database } from './Database';
import { makeTaskQueue } from './makeTaskQueue';
import { Output } from './Output';

type WorkflowState = 'unknown' | 'started' | 'success' | 'failure';

const execAsync = promisify(exec);

const execWithStdin = (command: string, input: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const proc = spawnProcess(command, { shell: '/bin/sh' });
    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
    proc.on('error', reject);
    proc.stdin?.write(input);
    proc.stdin?.end();
  });

export const CoreGithubWorkflowLive = Layer.effect(
  Core,
  Effect.gen(function* () {
    const { config } = yield* Config;
    const ghConfig = config as PublisherConfigGithubWorkflow;
    const output = yield* Output;
    const db = yield* Database;
    const queue = yield* makeTaskQueue;

    const buildNumberRef = yield* Ref.make(0);
    const applicationStatePubSub =
      yield* PubSub.unbounded<ApplicationState>();
    const workflowStatePubSub = yield* PubSub.unbounded<WorkflowState>();
    const workflowRunUrlRef = yield* Ref.make('');

    const publishState = (state: ApplicationState) =>
      PubSub.publish(applicationStatePubSub, state).pipe(Effect.asVoid);

    const applicationState = Stream.fromPubSub(applicationStatePubSub);

    yield* publishState(ApplicationState.Starting);

    const cancelWorkflow = Effect.gen(function* () {
      type Run = { name: string; conclusion: string; databaseId: number };

      const matchesEnvironment = (run: Run): boolean =>
        run.name.includes(`[env: ${ghConfig.environment}]`);
      const isCompleted = (run: Run): boolean => !!run.conclusion;

      const listCommand = `gh run list --workflow=${ghConfig.workflow} --repo ${ghConfig.repo} --json name,conclusion,databaseId --limit 100`;

      const listResult = yield* Effect.tryPromise({
        try: () => execAsync(listCommand),
        catch: (e) => e,
      }).pipe(Effect.option);

      if (listResult._tag === 'None') {
        yield* output.publish('Error canceling the workflow', 'error');
        return;
      }

      const runs = JSON.parse(listResult.value.stdout) as Array<Run>;
      for (const run of runs) {
        if (!isCompleted(run) && matchesEnvironment(run)) {
          yield* Effect.tryPromise(() =>
            execAsync(
              `gh run cancel ${run.databaseId} --repo ${ghConfig.repo}`,
            ),
          ).pipe(Effect.catchAll(() => Effect.void));
        }
      }

      for (let checkAttempt = 1; checkAttempt <= 6; checkAttempt++) {
        yield* Effect.sleep(10_000);

        const checkResult = yield* Effect.tryPromise({
          try: () => execAsync(listCommand),
          catch: (e) => e,
        }).pipe(Effect.option);

        if (checkResult._tag === 'None') {
          return;
        }

        const currentRuns = JSON.parse(
          checkResult.value.stdout,
        ) as Array<Run>;
        if (
          currentRuns.every(
            (run) => isCompleted(run) || !matchesEnvironment(run),
          )
        ) {
          return;
        }
      }
    });

    const runWorkflow = (clean: boolean) =>
      Effect.gen(function* () {
        yield* output.publish(
          clean
            ? 'Starting the workflow (clean build)'
            : 'Starting the workflow',
          'info',
        );

        const done = yield* Deferred.make<boolean>();

        const dispatchResult = yield* Effect.tryPromise({
          try: () =>
            execWithStdin(
              `gh workflow run ${ghConfig.workflow} --repo ${ghConfig.repo} --ref ${ghConfig.ref} --json`,
              JSON.stringify({
                ...ghConfig.inputs,
                publisher_payload: JSON.stringify({
                  callbackUrl:
                    ghConfig.publisherBaseUrl + '/github-workflow-status',
                  clearCache: clean,
                  environmentVariables: ghConfig.environmentVariables,
                } satisfies WorkflowPublisherPayload),
              }),
            ),
          catch: (e) => e,
        }).pipe(Effect.option);

        if (dispatchResult._tag === 'None') {
          yield* output.publish('Error starting the workflow', 'error');
          return false;
        }

        const monitorQueue =
          yield* PubSub.subscribe(workflowStatePubSub);
        const monitorFiber = yield* Effect.fork(
          Stream.runForEach(
            Stream.fromQueue(monitorQueue).pipe(
              Stream.drop(1),
              Stream.takeUntil(
                (s) => s === 'success' || s === 'failure',
              ),
            ),
            (state) =>
              Effect.gen(function* () {
                const url = yield* Ref.get(workflowRunUrlRef);
                if (state === 'started') {
                  yield* output.publish('Workflow started', 'info');
                  yield* output.publish('Logs: ' + url);
                }
                if (state === 'success' || state === 'failure') {
                  yield* output.publish(
                    state === 'success'
                      ? 'Workflow succeeded'
                      : 'Workflow failed or cancelled',
                    state === 'success' ? 'success' : 'error',
                  );
                  yield* output.publish('Logs: ' + url);
                  yield* Deferred.succeed(done, state === 'success');
                }
              }),
          ),
        );

        const result = yield* Effect.race(
          Deferred.await(done),
          Effect.gen(function* () {
            yield* Effect.sleep(ghConfig.workflowTimeout);
            yield* output.publish('Timeout reached', 'error');
            return false;
          }),
        );

        yield* Fiber.interrupt(monitorFiber);
        return result;
      });

    const buildTaskGh = (args?: { clean: boolean }): Effect.Effect<boolean> =>
      Effect.scoped(
        Effect.gen(function* () {
          yield* Ref.update(buildNumberRef, (n) => n + 1);
          const buildNumber = yield* Ref.get(buildNumberRef);
          yield* publishState(
            buildNumber === 1
              ? ApplicationState.Starting
              : ApplicationState.Updating,
          );

          const startedAt = Date.now();
          const outputLog: Array<string> = [];
          const logQueue = yield* output.subscribe;
          const collectFiber = yield* Effect.fork(
            Stream.runForEach(Stream.fromQueue(logQueue), (chunk) =>
              Effect.sync(() => {
                outputLog.push(
                  `${new Date().toISOString().substring(0, 19).replace('T', ' ')} ${chunk}`,
                );
              }),
            ),
          );

          const finalizeBuild = (isSuccess: boolean) =>
            Effect.gen(function* () {
              yield* publishState(
                isSuccess ? ApplicationState.Ready : ApplicationState.Error,
              );
              yield* db.saveBuild({
                type: 'github-workflow',
                startedAt,
                finishedAt: Date.now(),
                success: isSuccess,
                logs: outputLog.join(''),
              });
              yield* Fiber.interrupt(collectFiber);
              return isSuccess;
            });

          const attempts = buildNumber === 1 ? 3 : 1;
          for (let attempt = 1; attempt <= attempts; attempt++) {
            const result = yield* runWorkflow(
              attempt === 2 ? true : !!args?.clean,
            );
            if (result) {
              return yield* finalizeBuild(true);
            }
          }
          return yield* finalizeBuild(false);
        }),
      );

    const start = Effect.gen(function* () {
      yield* queue.addAndRun(cancelWorkflow);
      if (ghConfig.cleanBuildOnStart) {
        yield* queue.addPending([buildTaskGh({ clean: true })]);
      }
    });

    const stop = queue.clear;

    const build = Effect.gen(function* () {
      const tasks = yield* queue.getPending;
      if (tasks.length === 0) {
        yield* queue.addAndRun(buildTaskGh());
      }
    });

    const clean = Effect.gen(function* () {
      yield* queue.clear;
      yield* Ref.set(buildNumberRef, 0);
      yield* queue.addAndRun(buildTaskGh({ clean: true }));
    });

    const handleWorkflowStatus = (
      status: string,
      workflowRunUrl: string,
    ) =>
      Effect.gen(function* () {
        yield* Ref.set(workflowRunUrlRef, workflowRunUrl);
        yield* PubSub.publish(
          workflowStatePubSub,
          status as WorkflowState,
        );
      });

    return {
      applicationState,
      start,
      stop,
      build,
      clean,
      getBuildNumber: Ref.get(buildNumberRef),
      handleWorkflowStatus,
    };
  }),
);
