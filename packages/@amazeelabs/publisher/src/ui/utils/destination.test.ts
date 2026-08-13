import { expect, test } from 'vitest';

import { sameOriginDestination } from './destination';

const origin = window.location.origin;

test('accepts a relative path', () => {
  expect(sameOriginDestination('/some/page')).toBe('/some/page');
});

test('keeps the query and the fragment of a relative path', () => {
  expect(sameOriginDestination('/some/page?a=b#c')).toBe('/some/page?a=b#c');
});

test('reduces an absolute url on the current origin to a path', () => {
  expect(sameOriginDestination(`${origin}/some/page?a=b`)).toBe(
    '/some/page?a=b',
  );
});

test('rejects a destination on another origin', () => {
  expect(sameOriginDestination('https://evil.example/steal')).toBeNull();
});

test('rejects a protocol relative destination', () => {
  expect(sameOriginDestination('//evil.example/steal')).toBeNull();
});

test.each([
  'javascript:alert(1)',
  'JavaScript:alert(1)',
  '  javascript:alert(1)',
  'data:text/html,<script>alert(1)</script>',
  'vbscript:msgbox(1)',
])('rejects the %s destination', (dest) => {
  expect(sameOriginDestination(dest)).toBeNull();
});

test('rejects an absent or empty destination', () => {
  expect(sameOriginDestination(null)).toBeNull();
  expect(sameOriginDestination('')).toBeNull();
});

test('rejects a malformed destination', () => {
  expect(sameOriginDestination('http://')).toBeNull();
});
