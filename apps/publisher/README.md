# @custom/publisher

This project's instance of `@amazeelabs/publisher`. It builds and deploys
`@custom/website` and serves the build status UI at `/___status/`. All settings
live in `publisher.config.ts`; see the `@amazeelabs/publisher` README for the
generic options.

## Usage

```bash
pnpm dev   # gatsby clean in apps/website, then start Publisher
pnpm open  # open http://127.0.0.1:8000/___status/
```

The mode depends on whether `LAGOON` is set:

- **Local** (no `LAGOON`): `local` mode on port 8000. Builds the website with
  `pnpm build:gatsby` against Drupal at `http://127.0.0.1:8888`, then serves
  `apps/website/public` with `netlify dev` on port 7999. Publisher proxies all
  other requests to it. OAuth2 is disabled.
- **Lagoon**: `github-workflow` mode on port 3000. Dispatches
  `.github/workflows/fe_build.yml` on the `LAGOON_GIT_BRANCH` ref, which builds
  the website and deploys it to Netlify. Access to the status UI requires OAuth2
  login against Drupal.

On Lagoon, the `build` service runs Publisher (`publisher` target in
`.lagoon/Dockerfile`). A post-rollout task in `.lagoon.yml` triggers a clean
build.

## Configuration

Lagoon defaults are in `.lagoon.env` and per-environment overrides in
`.lagoon.env.<branch>`. See
[Environment overrides](../../README.md#environment-overrides) for the GitHub
and Netlify credentials, and
[Publisher authentication with Drupal](../../README.md#publisher-authentication-with-drupal)
for the Drupal consumer, keys and permission.

Read by `publisher.config.ts` on Lagoon:

- `PUBLISHER_OAUTH2_CLIENT_ID`, `PUBLISHER_OAUTH2_CLIENT_SECRET`: Drupal
  Publisher consumer credentials.
- `PUBLISHER_OAUTH2_SESSION_SECRET`: signs the session cookie.
- `PUBLISHER_OAUTH2_ENVIRONMENT_TYPE`: `development` or `production`.
- `PUBLISHER_OAUTH2_TOKEN_HOST`: Drupal base URL for OAuth2.
- `SERVICE_NAME`, `LAGOON_ENVIRONMENT`, `LAGOON_PROJECT`, `LAGOON_KUBERNETES`:
  compose the Publisher base URL that the workflow reports its status to.
- `LAGOON_GIT_BRANCH`: workflow ref, environment and `env` input.

Forwarded to the build workflow when set: `DRUPAL_EXTERNAL_URL` (also sent as
`DRUPAL_INTERNAL_URL`), `NETLIFY_URL`, `NETLIFY_SITE_ID`, `NETLIFY_AUTH_TOKEN`,
`PUBLISHER_SKIP_AUTHENTICATION`, the `PUBLISHER_OAUTH2_*` variables,
`VITE_DECAP_REPO`, `VITE_DECAP_BRANCH`, `PUBLISHER_SLACK_WEBHOOK`,
`PUBLISHER_SLACK_CHANNEL`, `PUBLISHER_URL`, `LAGOON_PROJECT` and
`LAGOON_ENVIRONMENT`.

## Dependencies

- Depends on: `@amazeelabs/publisher`.
- Builds: `@custom/website`.
- Authenticates against: `@custom/cms` (Lagoon only).
