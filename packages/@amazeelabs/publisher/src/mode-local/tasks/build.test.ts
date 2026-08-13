import { beforeEach, expect, test, vi } from 'vitest';

import { setConfig } from '../../tools/config';
import { saveBuildInfoSafely } from '../../tools/database';
import { TaskController } from '../../tools/queue';
import { core } from '../core';
import { defaultConfig, reset } from '../tools/testing';
import { buildTask } from './build';

vi.mock('../../tools/database');

let output: Array<string> = [];

beforeEach(async () => {
  await reset();

  core.output$.subscribe((chunk) => {
    output.push(chunk);
  });
  output = [];

  vi.clearAllMocks();
});

test('buildRunTask stops the build queue', async () => {
  setConfig({
    ...defaultConfig,
    commands: {
      ...defaultConfig.commands,
      build: { command: 'echo "build fail"; exit 1' },
    },
  });

  const controller = new TaskController();

  await buildTask()(controller);
  expect(output).toStrictEqual([
    'ℹ️ Starting command: "echo "build fail"; exit 1"\n',
    'build fail\n',
    '❌ Command exited with 1: "echo "build fail"; exit 1"\n',
    'ℹ️ Starting command: "echo "clean""\n',
    'clean\n',
    '✅ Command exited: "echo "clean""\n',
    'ℹ️ Starting command: "echo "build fail"; exit 1"\n',
    'build fail\n',
    '❌ Command exited with 1: "echo "build fail"; exit 1"\n',
    'ℹ️ Starting command: "echo "build fail"; exit 1"\n',
    'build fail\n',
    '❌ Command exited with 1: "echo "build fail"; exit 1"\n',
  ]);
});

test('successful builds are saved to database', async () => {
  const date = '\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}';
  setConfig(defaultConfig);
  await buildTask()(new TaskController());
  await buildTask()(new TaskController());
  expect(saveBuildInfoSafely).toHaveBeenCalledTimes(2);
  expect(saveBuildInfoSafely).toHaveBeenNthCalledWith(1, {
    startedAt: expect.any(Number),
    finishedAt: expect.any(Number),
    success: true,
    type: 'full',
    logs: expect.stringMatching(
      new RegExp(
        `${date} ℹ️ Starting command: "echo "build""
${date} build
${date} ✅ Command exited: "echo "build""
${date} ℹ️ Starting command: "echo "serve"; while true; do sleep 86400; done"
${date} serve
${date} ℹ️ Starting command: "echo "deploy""
${date} deploy
${date} ✅ Command exited: "echo "deploy""`,
        's',
      ),
    ),
  });
  expect(saveBuildInfoSafely).toHaveBeenNthCalledWith(2, {
    startedAt: expect.any(Number),
    finishedAt: expect.any(Number),
    success: true,
    type: 'incremental',
    logs: expect.stringMatching(
      new RegExp(
        `${date} ℹ️ Starting command: "echo "build""
${date} build
${date} ✅ Command exited: "echo "build""
${date} ℹ️ Starting command: "echo "deploy""
${date} deploy
${date} ✅ Command exited: "echo "deploy""`,
        's',
      ),
    ),
  });
});

test('a cancelled build is saved to database once', async () => {
  setConfig({
    ...defaultConfig,
    commands: {
      ...defaultConfig.commands,
      build: { command: 'echo "build starting"; sleep 1' },
    },
  });
  const controller = new TaskController();
  const build = buildTask()(controller);
  await new Promise((resolve) => setTimeout(resolve, 100));
  controller.cancel();
  await build;
  expect(saveBuildInfoSafely).toHaveBeenCalledTimes(1);
  expect(saveBuildInfoSafely).toHaveBeenCalledWith(
    expect.objectContaining({ success: false }),
  );
});

test('failed builds are saved to database', async () => {
  setConfig({
    ...defaultConfig,
    commands: {
      ...defaultConfig.commands,
      build: { command: 'echo "build fail"; exit 1' },
    },
  });
  await buildTask()(new TaskController());
  await buildTask()(new TaskController());
  expect(saveBuildInfoSafely).toHaveBeenCalledTimes(2);
  expect(saveBuildInfoSafely).toHaveBeenNthCalledWith(1, {
    startedAt: expect.any(Number),
    finishedAt: expect.any(Number),
    success: false,
    type: 'full',
    logs: expect.any(String),
  });
  expect(saveBuildInfoSafely).toHaveBeenNthCalledWith(2, {
    startedAt: expect.any(Number),
    finishedAt: expect.any(Number),
    success: false,
    type: 'incremental',
    logs: expect.any(String),
  });
});
