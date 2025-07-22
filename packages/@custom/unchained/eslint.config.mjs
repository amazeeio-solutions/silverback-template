import { base } from '@custom/eslint-config';
import graphqlPlugin from '@graphql-eslint/eslint-plugin';

export default [
  ...base,
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@graphql-eslint': graphqlPlugin,
    },
    rules: {
      '@graphql-eslint/known-type-names': 'error',
      '@graphql-eslint/known-directives': 'error',
      '@graphql-eslint/fields-on-correct-type': 'error',
      '@graphql-eslint/provided-required-arguments': 'error',
      '@graphql-eslint/no-unused-variables': 'warn',
    },
  },
];
