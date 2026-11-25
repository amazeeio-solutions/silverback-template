# @amazeelabs/react-intl

A minimal wrapper around [react-intl](https://formatjs.io/) that exposes
`IntlProvider` and `useIntl` for both client and server components.

## Usage

```tsx
import { IntlProvider, useIntl } from '@amazeelabs/react-intl';

<IntlProvider locale={locale} messages={messages}>
  <Header />
</IntlProvider>;

function Header() {
  const intl = useIntl();
  return <h1>{intl.formatMessage({ defaultMessage: 'Welcome' })}</h1>;
}
```

- Default export (`client.js`): re-exports `react-intl`, marked `'use client'`.
- `react-server` export (`server.js`): `IntlProvider` creates an intl object
  with `createIntl` and renders the client provider; `useIntl` returns that
  object. It is a module-level singleton, so the provider must render before any
  server component calls `useIntl`.

## Dependencies

- Used by: `packages/ui` (`Frame` route, Storybook preview, components) and
  `packages/seo`.
