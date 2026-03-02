# @amazeelabs/bridge

Framework-agnostic React navigation and routing primitives.

## What it does

Provides generic `Link`, `LocationProvider`, and `useLocation` implementations
that can be overridden by framework-specific packages.

## Framework implementations

See `@amazeelabs/bridge-` packages.

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
