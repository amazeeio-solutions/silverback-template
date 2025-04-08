import { defineConfig, frontend } from '@custom/eslint-config';

export default defineConfig([
  ...frontend,
  {
    ignores: [
      '.turbo/**',
      'build/**',
      'coverage/**',
      'node_modules/**',
    ],
  },
]); 