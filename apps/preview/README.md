# @custom/preview

Real-time preview of unpublished content. An Express server (`server/`) serves a
React app (`src/`) that renders the `Preview` route of `@custom/ui` with data
fetched from Drupal, and refreshes it while editors type. See
[Website preview](../../README.md#website-preview) for the Drupal setup.

## Usage

- `pnpm prep:app`: build the app (Vite) into `dist/`.
- `pnpm prep:server`: compile the server (SWC) into `build/`.
- `pnpm start`: run the compiled server.
- `pnpm dev:server`: run the server from source in watch mode. Serves `dist/`,
  so build the app first.
- `pnpm dev:app`: Vite dev server for `src/` only, without the Express routes.
- `pnpm test:static`: TypeScript and ESLint.

The server listens on port 8001, or 3000 when `LAGOON` is set. On Lagoon it runs
as the `preview` service (`preview` target in `.lagoon/Dockerfile`).

## How it works

- `silverback_autosave` (from `@amazeelabs/silverback-autosave`) POSTs the
  entity type, ID and language to `<PREVIEW_URL>/__preview` on every autosave.
  `PREVIEW_URL` is a Drupal environment variable and also sets the preview host
  embedded in the Drupal edit form
  (`apps/cms/scaffold/settings.php.append.txt`).
- The server broadcasts these updates over a WebSocket on `/__preview`. The app
  passes them to `usePreviewRefresh`, which refetches the preview query.
- `/endpoint.js` exposes `<DRUPAL_URL>/graphql` to the app, which runs the
  persisted operations of `@custom/schema` against it with its own executor
  (`src/drupal-executor.ts`).

## Authentication

Set with `AUTHENTICATION_TYPE`: `oauth2`, `basic` or `noauth`. Lagoon
environments use `oauth2` (`.lagoon.env`); `noauth` is only the local default.

With `oauth2`, users log in through the authorization code flow against Drupal
(`/oauth`, `/oauth/callback`, `/oauth/login`, `/oauth/logout`). Their account
needs preview access in Drupal. A valid `preview_access_token` from a shared
preview link (query parameter or cookie) skips the login.

On Lagoon, a deploy hook of the `custom` Drupal module creates the `preview`
OAuth2 consumer from the Drupal variables `PREVIEW_URL` and
`PREVIEW_OAUTH2_CLIENT_SECRET`. `OAUTH2_CLIENT_SECRET` must match the latter.

## Configuration

Lagoon defaults are in `.lagoon.env` and per-environment overrides in
`.lagoon.env.<branch>`. All variables have local defaults.

- `DRUPAL_URL`: Drupal base URL (GraphQL, OAuth2 and access checks).
- `AUTHENTICATION_TYPE`: see above.
- `BASIC_AUTH_USER`, `BASIC_AUTH_PASSWORD`: credentials for `basic`.
- `OAUTH2_CLIENT_ID`, `OAUTH2_CLIENT_SECRET`, `OAUTH2_SCOPE`: Drupal consumer.
- `OAUTH2_TOKEN_PATH`, `OAUTH2_AUTHORIZE_PATH`: Drupal OAuth2 endpoints.
- `OAUTH2_SESSION_SECRET`: signs the session cookie.
- `OAUTH2_ENVIRONMENT_TYPE`: `production` enables secure cookies behind a proxy.
- `ENCRYPTION_KEY`: encrypts the access token stored in the session. Random per
  process if unset.
- `PROJECT_NAME`: used to compose URLs in the `.lagoon.env*` files.

## Dependencies

- Depends on: `@custom/schema`, `@custom/ui`.
- Notified and embedded by: `@custom/cms`.
- Used by: `tests/e2e`.
