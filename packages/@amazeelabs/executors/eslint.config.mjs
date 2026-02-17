import { defineConfig, frontend } from '@custom/eslint-config';

export default defineConfig([
  ...frontend,
  {
    ignores: [
      'build/**',
      'test/dist/**',
      'test-results/**',
      'playwright-report/**',
    ],
  },
]);
