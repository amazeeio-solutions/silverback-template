import { expect, test } from 'vitest';

import {
  ApplicationState,
  envVarNameSchema,
  envVarsSchema,
  workflowPublisherPayloadSchema,
  workflowStatusNotificationSchema,
} from './exports';

test('application state enum exposes every lifecycle value', () => {
  expect(ApplicationState).toEqual({
    Starting: 'starting',
    Fatal: 'fatal',
    Error: 'error',
    Updating: 'updating',
    Ready: 'ready',
  });
});

test.each(['started', 'success', 'failure'])(
  'workflow status notification accepts the "%s" status',
  (status) => {
    const result = workflowStatusNotificationSchema.safeParse({
      status,
      workflowRunUrl: 'https://github.com/owner/repo/actions/runs/1',
    });
    expect(result.success).toBe(true);
    expect(result.success && result.data).toEqual({
      status,
      workflowRunUrl: 'https://github.com/owner/repo/actions/runs/1',
    });
  },
);

test('workflow status notification strips unknown properties', () => {
  const result = workflowStatusNotificationSchema.safeParse({
    status: 'success',
    workflowRunUrl: 'https://github.com/owner/repo/actions/runs/1',
    unexpected: 'value',
  });
  expect(result.success).toBe(true);
  expect(result.success && result.data).toEqual({
    status: 'success',
    workflowRunUrl: 'https://github.com/owner/repo/actions/runs/1',
  });
});

test('workflow status notification rejects an unknown status value', () => {
  const result = workflowStatusNotificationSchema.safeParse({
    status: 'cancelled',
    workflowRunUrl: 'https://github.com/owner/repo/actions/runs/1',
  });
  expect(result.success).toBe(false);
  expect(!result.success && result.error.issues[0]?.path).toEqual(['status']);
});

test('workflow status notification rejects a missing status', () => {
  const result = workflowStatusNotificationSchema.safeParse({
    workflowRunUrl: 'https://github.com/owner/repo/actions/runs/1',
  });
  expect(result.success).toBe(false);
  expect(!result.success && result.error.issues[0]?.path).toEqual(['status']);
});

test('workflow status notification rejects a missing workflow run url', () => {
  const result = workflowStatusNotificationSchema.safeParse({
    status: 'started',
  });
  expect(result.success).toBe(false);
  expect(!result.success && result.error.issues[0]?.path).toEqual([
    'workflowRunUrl',
  ]);
});

test('workflow status notification rejects a non-url workflow run url', () => {
  const result = workflowStatusNotificationSchema.safeParse({
    status: 'started',
    workflowRunUrl: 'not-a-url',
  });
  expect(result.success).toBe(false);
  expect(!result.success && result.error.issues[0]?.message).toBe(
    'Invalid url',
  );
});

test('workflow status notification rejects a non-string workflow run url', () => {
  const result = workflowStatusNotificationSchema.safeParse({
    status: 'started',
    workflowRunUrl: 42,
  });
  expect(result.success).toBe(false);
  expect(!result.success && result.error.issues[0]?.path).toEqual([
    'workflowRunUrl',
  ]);
});

test.each([undefined, null, 'string', 42, []])(
  'workflow status notification rejects the non-object payload %o',
  (payload) => {
    expect(workflowStatusNotificationSchema.safeParse(payload).success).toBe(
      false,
    );
  },
);

test('workflow status notification reports every invalid field at once', () => {
  const result = workflowStatusNotificationSchema.safeParse({
    status: 'nope',
    workflowRunUrl: 'nope',
  });
  expect(result.success).toBe(false);
  expect(
    !result.success && result.error.issues.map((issue) => issue.path),
  ).toEqual([['status'], ['workflowRunUrl']]);
});

test('publisher payload accepts a minimal payload without environment variables', () => {
  const result = workflowPublisherPayloadSchema.safeParse({
    callbackUrl: 'https://publisher.example.com/callback',
    clearCache: false,
  });
  expect(result.success).toBe(true);
  expect(result.success && result.data.environmentVariables).toBeUndefined();
});

test('publisher payload accepts environment variables', () => {
  const result = workflowPublisherPayloadSchema.safeParse({
    callbackUrl: 'https://publisher.example.com/callback',
    clearCache: true,
    environmentVariables: { DRUPAL_HASH_SALT: 'salt', _private: '' },
  });
  expect(result.success).toBe(true);
  expect(result.success && result.data.environmentVariables).toEqual({
    DRUPAL_HASH_SALT: 'salt',
    _private: '',
  });
});

test('publisher payload rejects a missing callback url', () => {
  const result = workflowPublisherPayloadSchema.safeParse({ clearCache: true });
  expect(result.success).toBe(false);
  expect(!result.success && result.error.issues[0]?.path).toEqual([
    'callbackUrl',
  ]);
});

test('publisher payload rejects a non-url callback url', () => {
  const result = workflowPublisherPayloadSchema.safeParse({
    callbackUrl: 'publisher.example.com/callback',
    clearCache: true,
  });
  expect(result.success).toBe(false);
  expect(!result.success && result.error.issues[0]?.message).toBe(
    'Invalid url',
  );
});

test('publisher payload rejects a missing clear cache flag', () => {
  const result = workflowPublisherPayloadSchema.safeParse({
    callbackUrl: 'https://publisher.example.com/callback',
  });
  expect(result.success).toBe(false);
  expect(!result.success && result.error.issues[0]?.path).toEqual([
    'clearCache',
  ]);
});

test('publisher payload rejects a non-boolean clear cache flag', () => {
  const result = workflowPublisherPayloadSchema.safeParse({
    callbackUrl: 'https://publisher.example.com/callback',
    clearCache: 'true',
  });
  expect(result.success).toBe(false);
  expect(!result.success && result.error.issues[0]?.path).toEqual([
    'clearCache',
  ]);
});

test('publisher payload rejects invalid environment variable names', () => {
  const result = workflowPublisherPayloadSchema.safeParse({
    callbackUrl: 'https://publisher.example.com/callback',
    clearCache: true,
    environmentVariables: { '1_INVALID': 'value' },
  });
  expect(result.success).toBe(false);
  expect(!result.success && result.error.issues[0]?.message).toBe(
    'Invalid environment variable name',
  );
});

test.each(['DRUPAL_HASH_SALT', '_private', 'a', 'Mixed_Case_1'])(
  'environment variable name "%s" is valid',
  (name) => {
    expect(envVarNameSchema.safeParse(name).success).toBe(true);
  },
);

test.each(['1LEADING_DIGIT', 'WITH-DASH', 'WITH SPACE', '', 'WITH.DOT'])(
  'environment variable name "%s" is invalid',
  (name) => {
    const result = envVarNameSchema.safeParse(name);
    expect(result.success).toBe(false);
    expect(!result.success && result.error.issues[0]?.message).toBe(
      'Invalid environment variable name',
    );
  },
);

test('environment variables reject non-string values', () => {
  const result = envVarsSchema.safeParse({ VALID_NAME: 42 });
  expect(result.success).toBe(false);
  expect(!result.success && result.error.issues[0]?.path).toEqual([
    'VALID_NAME',
  ]);
});

test('environment variables accept an empty record', () => {
  expect(envVarsSchema.safeParse({}).success).toBe(true);
});

test('environment variables reject a non-object value', () => {
  expect(envVarsSchema.safeParse('DRUPAL_HASH_SALT=salt').success).toBe(false);
});
