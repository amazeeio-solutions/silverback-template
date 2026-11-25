import { expect, test } from 'vitest';

import { BuildLog, buildLogLimit } from './buildLog';

test('output below the limit is kept verbatim', () => {
  const log = new BuildLog();
  log.append('first\n');
  log.append('second\n');

  expect(log.toString()).toBe('first\nsecond\n');
});

test('output beyond the limit stays bounded', () => {
  const log = new BuildLog();
  // A build that logs a progress bar or a dependency tree can produce far more
  // than this, and the whole buffer is held in memory until the build ends.
  for (let chunk = 0; chunk < 200; chunk++) {
    log.append('x'.repeat(10 * 1024));
  }

  expect(log.toString().length).toBeLessThanOrEqual(buildLogLimit);
});

test('the most recent output survives truncation', () => {
  const log = new BuildLog();
  log.append('the-oldest-line\n');
  log.append('y'.repeat(buildLogLimit));
  log.append('the-newest-line\n');

  const result = log.toString();
  expect(result).toContain('the-newest-line');
  expect(result).not.toContain('the-oldest-line');
});

test('truncation is visible in the log', () => {
  const log = new BuildLog();
  log.append('z'.repeat(buildLogLimit * 2));

  expect(log.toString()).toContain('earlier output truncated');
});
