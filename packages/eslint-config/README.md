# @custom/eslint-config

Shared ESLint flat configs for the monorepo. It also provides the `eslint`
binary, so consumers do not install ESLint themselves.

## Usage

`index.mjs` exports:

- `base`: ESLint and typescript-eslint recommended rules, `promise`, `prettier`,
  import sorting (`simple-import-sort`, `import`) and `no-only-tests`.
- `frontend`: `base` plus React, React Hooks, Storybook, Tailwind CSS and
  `formatjs` rules (enforced message ids and default messages, warnings for
  literal strings in JSX).
- `defineConfig`: `defineFlatConfig` from `eslint-define-config`.

Add it as a `workspace:*` dev dependency and create an `eslint.config.mjs`:

```js
import { defineConfig, frontend } from '@custom/eslint-config';

export default defineConfig([
  ...frontend,
  {
    ignores: ['build/**'],
  },
]);
```

Then run `eslint .` from the package. The `eslint` bin is a wrapper around the
ESLint version installed in this package, to avoid collisions with other
versions in the project.

## Dependencies

Used by: all apps (except `@custom/cms`), most packages and the test suites.
