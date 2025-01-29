// @ts-expect-error There's no typing 😢
import { defineConfig, frontend } from '@custom/eslint-config';

export default defineConfig([
  ...frontend,
  {
    ignores: [
      '**/.netlify/**',
      '.cache/**',
      '.turbo/**',
      'public/**',
      'dist/**',
    ],
  },
]);
