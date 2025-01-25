import { base, defineConfig } from '@custom/eslint-config';

export default defineConfig([
  ...base,
  {
    ignores: ['playwright-report/**', 'test-results/**'],
  },
]);
