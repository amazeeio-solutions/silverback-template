# @amazeelabs/bridge-storybook

Storybook implementation of the `@amazeelabs/bridge` interface. Navigation is
kept in React state instead of changing the browser location, and every
navigation is logged as a `navigate` action in the Storybook actions panel.

Requires `@storybook/addon-actions` (>=8.5.2) and `react` (>=18.3.1) as peer
dependencies.

## Usage

Alias `@amazeelabs/bridge` to this package in `.storybook/main.ts`:

```ts
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

Wrap stories in `LocationProvider` (required by `useLocation` and `Link`). The
optional `currentLocation` prop sets the initial location, e.g. from story
parameters in `.storybook/preview.tsx`:

```tsx
const LocationDecorator: Decorator = (Story, ctx) => (
  <LocationProvider currentLocation={ctx.parameters.location}>
    <Story />
  </LocationProvider>
);
```

`Link` calls `navigate(href)` on click unless an `onClick` handler is passed.
The extra `currentLocation()` export returns the latest location, for assertions
in play functions.

## Dependencies

- Depends on: `@amazeelabs/bridge` (types only, dev dependency).
- Used by: `packages/ui` (Storybook).
