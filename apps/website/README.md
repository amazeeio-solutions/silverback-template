# @custom/website

Gatsby 5 frontend that statically renders the public website with `@custom/ui`
and is deployed to Netlify. Content comes from Drupal (`@custom/cms`) and/or
Decap (`@custom/decap`), both loaded as Gatsby plugins.

## Usage

- `pnpm build`: build the site. If `gatsby-config.mjs` includes `@custom/cms`
  (checked by `has-drupal.mjs`), Drupal is started on port 8888 for the duration
  of the build; otherwise it runs `gatsby build` only.
- `pnpm build:gatsby`: `gatsby build` against an already running Drupal.
- `pnpm serve`: serve `public/` with `netlify dev` on `http://localhost:8000`,
  including functions, edge functions and redirects.
- `pnpm gatsby:develop`: Gatsby development server.
- `pnpm clean` / `pnpm full-rebuild`: `gatsby clean`, optionally followed by
  `build:gatsby`.

On Lagoon, builds are run by `@custom/publisher`.

## How it works

- **Data**: `@amazeelabs/gatsby-source-silverback` builds the Gatsby schema from
  `@custom/schema` (`graphqlrc.yml`). The `@custom/cms` and `@custom/decap`
  plugins add their data sources. To use only one CMS, see
  [Choose a CMS](../../README.md#choose-a-cms).
- **Operations**: `@amazeelabs/gatsby-plugin-operations` runs the persisted
  operations from `@custom/schema` (`build/operations.json`) in
  `gatsby-node.mjs` and in page queries.
- **Pages**: `gatsby-node.mjs` creates the home page per locale, a page per
  entry of `ListPagesQuery`, and the content hub and inquiry pages per locale.
  Templates in `src/templates` pass the query result to
  `OperationExecutorsProvider` and render a `@custom/ui/routes/*` component.
  `src/layouts/index.tsx` wraps all pages in the `Frame` route and adds a Drupal
  executor on `/graphql` for client-side operations.
- **Bridge and assets**: webpack aliases `@amazeelabs/bridge` to
  `@amazeelabs/bridge-gatsby`, so `@custom/ui` uses Gatsby links and location.
  Styles and static files of `@custom/ui` are served via
  `@amazeelabs/gatsby-plugin-static-dirs`.

## Netlify

`netlify.toml` is generated on `onPostBuild` from `netlify-base.toml` plus
redirects collected during the build (gitignored, do not edit).

- `netlify/functions/strangler.ts`: catch-all fallback built with
  `@amazeelabs/strangler-netlify`. Forwards unhandled requests to Drupal and
  returns its 301/302 redirects, otherwise `public/404.html`. See
  ["Strangling" legacy systems](../../README.md#strangling-legacy-systems).
- `netlify/functions/github-proxy.mts`: GitHub API proxy for the Decap backend
  (`@amazeelabs/decap-cms-backend-token-auth`).
- `netlify/edge-functions/github-proxy-auth.ts`: email login link authentication
  for the GitHub proxy (`@amazeelabs/token-auth-middleware`). Allowed email
  patterns are set in that file.
- `netlify/edge-functions/homepage-redirect.ts`: redirects `/` to the preferred
  language. The available languages are hardcoded.
- `deno.jsonc`: keeps the Deno runtime of `netlify dev` (edge functions) from
  using `node_modules`.

## Configuration

See [Environment overrides](../../README.md#environment-overrides). All
variables have local defaults.

- `NETLIFY_URL`: public site URL (sitemap, robots.txt, Drupal file URLs).
- `DRUPAL_INTERNAL_URL`, `DRUPAL_EXTERNAL_URL`: Drupal for build queries and for
  browser requests/proxies.
- `CLOUDINARY_CLOUDNAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: image
  processing.
- `NOINDEX`: `true` adds `X-Robots-Tag: noindex` and disallows all crawlers.
- `DECAP_GITHUB_TOKEN`: GitHub token used by the GitHub proxy.
- `JWT_SECRET`, `POSTMARK_API_TOKEN`: login link signing and sending for the
  GitHub proxy.

## Dependencies

- Depends on: `@custom/schema`, `@custom/ui`, `@custom/cms`, `@custom/decap`.
- Used by: `@custom/publisher` (build and deploy), `tests/e2e`.
