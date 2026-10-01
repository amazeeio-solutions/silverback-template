# @amazeelabs/bridge-gatsby

Gatsby implementation of the `@amazeelabs/bridge` interface. `Link` renders
Gatsby's `Link` (`href` is passed as `to`), `useLocation` reads the
`@reach/router` location and navigates with Gatsby's `navigate`, and
`LocationProvider` only renders its children.

Requires `gatsby` (>=5.14.1) and `react` (>=18.3.1) as peer dependencies.

## Usage

Alias `@amazeelabs/bridge` to this package in `gatsby-node.mjs`:

```js
export const onCreateWebpackConfig = ({ actions }) => {
  actions.setWebpackConfig({
    resolve: {
      alias: {
        '@amazeelabs/bridge': '@amazeelabs/bridge-gatsby',
      },
    },
  });
};
```

## Dependencies

- Depends on: `@amazeelabs/bridge` (types only, dev dependency).
- Used by: `apps/website`.
