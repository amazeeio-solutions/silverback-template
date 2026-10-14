# @amazeelabs/scalars

TypeScript types and React components for common GraphQL scalars. `Url`,
`Markup`, `ImageSource` and `Timestamp` are opaque string types, each paired
with a helper to render or parse it.

## Usage

- `Link`: takes a `Url` (or a `LocationType`) as `href`, plus optional `search`
  and `hash` overrides. Internal links render the `@amazeelabs/bridge` `Link`;
  external links and file downloads render a plain `<a>` (default
  `target="_blank"`, `rel="noreferrer"` for external URLs).
- `useLocation`: wraps the bridge hook; `navigate` accepts the same `search` and
  `hash` overrides. `LocationProvider` is re-exported from the bridge.
- `Html`: renders `Markup` with rehype. Supports `classNames` (CSS selector to
  class), `components` (tag overrides) and `plugins`. Headings get ids, and
  `<a>` tags render `Link`.
- `Image`: renders an `ImageSource` (JSON `ImageSourceStructure`) as a lazy
  loaded `<img>` (`priority` loads it eagerly). Cloudinary URLs with the `test`
  or `demo` cloud name are replaced by SVG placeholders.
- `timestamp()`: converts a `Timestamp` to a `Date`.
- Utilities: `overrideUrlParameters`, `isDownload`, `parseCloudinaryUrl`.

```tsx
import { Html, Link, Markup, Url } from '@amazeelabs/scalars';

<Link href={'/news' as Url} search={{ page: 2 }}>
  News
</Link>;
<Html markup={markup as Markup} classNames={{ p: 'mb-4' }} />;
```

## Dependencies

- Depends on: `@amazeelabs/bridge`. Requires `react` (^18.3.1) as a peer
  dependency.
- Used by: `packages/schema`, which maps the `Url`, `Markup` and `ImageSource`
  GraphQL scalars to these types in `codegen.ts` and re-exports the package, so
  `apps/website` and `packages/ui` import it via `@custom/schema`.
