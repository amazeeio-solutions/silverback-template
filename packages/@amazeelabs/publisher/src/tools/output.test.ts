import { expect, test } from 'vitest';

import { OutputSubject } from './output';

const collect = (subject: OutputSubject) => {
  const received: string[] = [];
  subject.subscribe((value) => received.push(value));
  return received;
};

test('prefixes info messages', () => {
  const subject = new OutputSubject();
  const received = collect(subject);

  subject.next('message', 'info');

  expect(received).toStrictEqual(['ℹ️ message\n']);
});

test('prefixes warning messages', () => {
  const subject = new OutputSubject();
  const received = collect(subject);

  subject.next('message', 'warning');

  expect(received).toStrictEqual(['⚠️ message\n']);
});

test('prefixes error messages', () => {
  const subject = new OutputSubject();
  const received = collect(subject);

  subject.next('message', 'error');

  expect(received).toStrictEqual(['❌ message\n']);
});

test('prefixes success messages', () => {
  const subject = new OutputSubject();
  const received = collect(subject);

  subject.next('message', 'success');

  expect(received).toStrictEqual(['✅ message\n']);
});

test('does not add a prefix when severity is undefined', () => {
  const subject = new OutputSubject();
  const received = collect(subject);

  subject.next('message');

  expect(received).toStrictEqual(['message\n']);
});

test('appends a trailing newline when the value lacks one', () => {
  const subject = new OutputSubject();
  const received = collect(subject);

  subject.next('message');

  expect(received[0]).toBe('message\n');
});

test('does not double the trailing newline when the value already ends in one', () => {
  const subject = new OutputSubject();
  const received = collect(subject);

  subject.next('message\n');

  expect(received[0]).toBe('message\n');
});

test('subscribers receive the formatted string', () => {
  const subject = new OutputSubject();
  const received: string[] = [];
  const unsubscribe = subject.subscribe((value) => received.push(value));

  subject.next('first', 'error');
  subject.next('second');

  unsubscribe.unsubscribe();

  expect(received).toStrictEqual(['❌ first\n', 'second\n']);
});
