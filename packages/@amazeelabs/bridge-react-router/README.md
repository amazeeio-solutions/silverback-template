# @amazeelabs/bridge-react-router

React Router (v7) implementation of the `@amazeelabs/bridge` interface. `Link`
renders React Router's `Link` (`href` is passed as `to`), `useLocation` wraps
React Router's `useLocation` and `useNavigate`, and `LocationProvider` only
renders its children.

Ships `react-router` (^7) as a dependency and requires `react` (^18) as a peer
dependency. Components must render inside a React Router router.

## Usage

Alias `@amazeelabs/bridge` to this package in your bundler, e.g. with Vite:

```js
export default defineConfig({
  resolve: {
    alias: {
      '@amazeelabs/bridge': '@amazeelabs/bridge-react-router',
    },
  },
});
```

## Dependencies

- Depends on: `@amazeelabs/bridge` (types only, dev dependency).
- Used by: no consumer in this template.
