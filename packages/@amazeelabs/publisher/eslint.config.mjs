import { defineConfig, frontend } from '@custom/eslint-config';

// `frontend` is `base` plus the react/storybook/tailwind rules. Those only
// match JSX and stories, so they are inert on the server sources.
export default defineConfig([
  ...frontend,
  {
    settings: {
      tailwindcss: {
        config: 'src/ui/tailwind.config.cjs',
      },
    },
  },
  {
    files: ['**/*.cjs'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    ignores: ['dist/**', 'storybook-static/**'],
  },
]);
