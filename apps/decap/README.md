# @custom/decap

Git-based CMS built on [Decap CMS](https://decapcms.org/), an alternative to
Drupal. Editors manage YAML files in `data/` and images in `media/`, and the
package also acts as a Gatsby plugin that feeds this content to
`@custom/website`.

## Usage

```bash
pnpm prep:vite     # build the admin UI to dist/
pnpm prep:scripts  # build the Gatsby sources to build/
pnpm dev           # admin UI dev server (Vite, /admin/), in-memory backend
pnpm start         # local proxy server that writes changes to the repo files
pnpm test:unit
```

The website serves the built admin UI at `/admin` and `media/` at `/media`. The
backend is chosen at runtime:

- `pnpm dev`: `test-repo` backend. Changes are not saved.
- On `localhost`, or without `VITE_DECAP_REPO`/`VITE_DECAP_BRANCH`: `proxy`
  backend at `http://localhost:8081`, provided by `pnpm start`.
- Otherwise: `token-auth` backend (`@amazeelabs/decap-cms-backend-token-auth`)
  through the website's `github-proxy` Netlify function. Outside of `prod`,
  collections are read-only.

## Content

- `data/page/*.yml`: pages, one file per page with all translations.
- `data/translatables.yml`: UI string translations. Keys come from
  `@custom/ui`'s `translatables.json`.
- `data/site.yml`: global settings.
- `media/`: uploaded images.

`gatsby-config.js` registers `getPages` and `getTranslatables` (`src/index.ts`)
with `@amazeelabs/gatsby-source-silverback`. They are bound to the `DecapPage`
and `DecapTranslatableString` types through `@sourceFrom` in `@custom/schema`.

Page previews render the `@custom/ui` `Page` route with `@custom/ui` styles. The
`PreviewDecapPage` operation runs in the browser against the `@custom/schema`
schema.

## Configuration

- `VITE_DECAP_REPO`, `VITE_DECAP_BRANCH` (build time): GitHub repository and
  branch to edit. On Lagoon they are set in `.lagoon/Dockerfile` and forwarded
  to the build by `@custom/publisher`.
- `NETLIFY_URL` (build time): base URL of the page edit links.
- `DECAP_GITHUB_TOKEN`: read by the website's `github-proxy` function.

To disable Decap, see [Choose a CMS](../../README.md#choose-a-cms).

## Dependencies

- Depends on: `@custom/schema`, `@custom/ui`.
- Used by: `@custom/website` (Gatsby plugin), `tests/e2e`, `tests/e2e-basic`.
