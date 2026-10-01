# @custom/cms

Drupal 10 backend that stores content and serves it through a GraphQL API at
`/graphql`. The package is also a Gatsby plugin: `@custom/website` loads it to
source content from Drupal and to proxy files, GraphQL requests, webforms and
assets to Drupal.

## Usage

Install and prepare everything from the repo root (see
[Installation](../../README.md#installation) and
[Drupal](../../README.md#drupal)). `prep` runs `composer install`, then installs
Drupal into a local SQLite database if none exists yet.

- `pnpm dev` / `pnpm start`: start Mailpit and Drupal on `http://127.0.0.1:8888`
  (PHP built-in server).
- `pnpm drupal-install`: install Drupal and import test content.
- `pnpm drush <command>`: Drush with the local environment set.
- `pnpm login`: one-time admin login link. `pnpm clear`: rebuild caches.
- `pnpm config:export` / `pnpm config:import`: sync `config/sync`.
- `pnpm content:export` / `pnpm content:import`: test content of the
  `test_content` module.
- `pnpm import-translations`: import UI translations.
- `pnpm cms:test:static`, `cms:test:unit`, `cms:test:integration`: PHPCS and
  PHPStan, PHPUnit unit and integration suites.

## Configuration

- `scaffold/` is appended to or copied into `web/sites/default` by Drupal
  scaffold. Local overrides go in `settings.local.php` and `services.local.yml`.
- The GraphQL server `main` reads its schema from `@custom/schema`
  (`src/schema.graphql`) and serves the persisted operations listed in
  `@custom/schema/build/operations.json`.
- `web/modules/custom` and `web/themes/custom` are symlinks to `packages/drupal`
  and `packages/drupal-themes`. `@amazeelabs/*` Drupal modules come from
  `node_modules` via a composer path repository. `prep` also links
  `packages/drupal-local` to `web/sites/default/modules`.

Environment variables (see also
[Environment overrides](../../README.md#environment-overrides)):

- `DRUPAL_HASH_SALT`: Drupal hash salt.
- `PUBLISHER_URL`, `NETLIFY_URL`, `PREVIEW_URL`: publisher, live website and
  preview app URLs, used for build webhooks and external preview.
- `CLOUDINARY_CLOUDNAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`:
  Cloudinary image processing.
- `DRUPAL_SLACK_WEBHOOK_URL`: Slack webhook. Blanked outside `prod` unless set.
- `OPEN_AI_API_KEY`: OpenAI key for `silverback_ai`.
- `LAGOON_ENVIRONMENT`: environment indicator, and email rerouting outside
  `prod`.
- `DRUPAL_INTERNAL_URL`, `DRUPAL_EXTERNAL_URL`: Drupal URLs used by the Gatsby
  plugin for build and client requests.
- `LAGOON`, `SKIP_DRUPAL_INSTALL`: skip the local database install in `prep`.

OAuth2 for the publisher and preview app:
[Publisher authentication with Drupal](../../README.md#publisher-authentication-with-drupal).
Preview setup: [Website preview](../../README.md#website-preview).

## Dependencies

Depends on:

- `@custom/schema`: GraphQL schema, persisted operations and the Gatsby
  directive autoloader.
- `@custom/ui`: `gutenberg.css` and `iframe.css` styles (symlinked into `web/`).
- `packages/drupal`, `packages/drupal-themes`: custom modules and the
  `custom_iframe` theme.
- `@amazeelabs/silverback-gatsby`, `@amazeelabs/silverback-gutenberg`,
  `@amazeelabs/silverback-iframe` and other `@amazeelabs/silverback-*` Drupal
  modules, plus `@amazeelabs/gatsby-source-silverback` for the Gatsby plugin.

Used by:

- `@custom/website`: Gatsby plugin and GraphQL content source.
- `@custom/preview`: fetches preview content and authenticates with OAuth2.
- `@custom/publisher`: triggered by Drupal build webhooks, authenticates with
  OAuth2.
