# @amazeelabs/bridge

Framework-agnostic React navigation and routing primitives.

## What it does

Provides generic `Link`, `LocationProvider`, and `useLocation` implementations
that can be overridden by framework-specific packages. It also exports the
`LinkType`, `LocationProviderType`, `LocationType` and `useLocationType` types
that those packages implement.

The default implementations render a plain `<a>`, pass children through, and
read/write `window.location`. `useLocation` returns `[location, navigate]`.

## Framework implementations

- `@amazeelabs/bridge-gatsby`
- `@amazeelabs/bridge-react-router`
- `@amazeelabs/bridge-storybook`

## Usage

Components import from `@amazeelabs/bridge`. Framework-specific implementations
are injected using bundler aliases:

```tsx
// Components always import from @amazeelabs/bridge
import { Link, useLocation } from '@amazeelabs/bridge';
```

Configure your bundler to alias the implementation:

```js
// Gatsby (gatsby-node.mjs)
export const onCreateWebpackConfig = ({ actions }) => {
  actions.setWebpackConfig({
    resolve: {
      alias: {
        '@amazeelabs/bridge': '@amazeelabs/bridge-gatsby',
      },
    },
  });
};

// Storybook (.storybook/main.ts)
const config: StorybookConfig = {
  viteFinal: (config) =>
    mergeConfig(config, {
      resolve: {
        alias: {
          '@amazeelabs/bridge': '@amazeelabs/bridge-storybook',
        },
      },
    }),
};
```

In this template, `packages/ui/.storybook/main.ts` aliases to the local
`bridge-storybook` build when it exists, and falls back to the package name.

## Dependencies

- Used by: `@amazeelabs/scalars` (runtime), and `@amazeelabs/bridge-gatsby`,
  `@amazeelabs/bridge-react-router`, `@amazeelabs/bridge-storybook` (types).
