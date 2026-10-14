# @amazeelabs/publisher

Build and deployment coordinator for static websites. Runs builds locally or in
a GitHub Actions workflow, serves a status UI with build logs and history at
`/___status/`, and optionally protects it with OAuth2 or basic auth.

## Usage

Create `publisher.config.ts` in the directory Publisher is started from:

```ts
import { defineConfig } from '@amazeelabs/publisher';

export default defineConfig({
  publisherPort: 8000,
  databaseUrl: '/tmp/publisher.sqlite',
  mode: 'local',
  commands: {
    clean: 'pnpm clean',
    build: { command: 'pnpm build' },
    serve: {
      command: 'pnpm serve --port=7999',
      readyPattern: 'Server now ready',
      port: 7999,
    },
  },
});
```

Start the server:

```bash
pnpm publisher
```

Routes:

- `/___status/`: status UI, logs and build history.
- `POST /___status/build`: trigger a build.
- `POST /___status/clean`: trigger a clean build, e.g. from a Drupal
  post-rollout task. Neither trigger route requires authentication.
- Any other path (local mode with `commands.serve`): proxied to the served build
  once it is ready. Until then, HTML requests are redirected to a status page.

## Configuration

All options are typed and documented in
[`src/tools/config.ts`](src/tools/config.ts). See
`apps/publisher/publisher.config.ts` for a setup that uses local mode in
development and GitHub workflow mode on Lagoon.

### Modes

- `local`: runs `commands.clean`, `commands.build`, and the optional `deploy`
  and `serve` commands. A failed build is retried twice, with a clean before the
  second attempt.
- `github-workflow`: dispatches `workflow` in `repo` on `ref` with a
  `publisher_payload` input (`callbackUrl`, `clearCache`,
  `environmentVariables`). The workflow reports its status to
  `POST <publisherBaseUrl>/github-workflow-status`; this template's
  `.github/workflows/fe_build.yml` uses
  [publisher-action](https://github.com/amazeeio-solutions/publisher-action) for
  that. Running builds are cancelled by matching `[env: <environment>]` in the
  workflow run name.

GitHub credentials for `github-workflow` mode, read from the environment:

- GitHub App (takes precedence): `GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY`
  (base64 encoded PEM) and `GITHUB_APP_INSTALLATION_ID`. The app needs the
  `actions: write` permission on the repository.
- Personal access token: `GH_TOKEN` or `GITHUB_TOKEN`.

### Authentication

If both are configured, `oAuth2` takes precedence over `basicAuth`. Without
either, all routes are public. Set `PUBLISHER_SKIP_AUTHENTICATION=true` to skip
authentication, e.g. locally.

```ts
export default defineConfig({
  // ...
  basicAuth: { username: 'publisher', password: 'publisher' },
});
```

OAuth2 requires an OAuth2 server such as Drupal
[simple_oauth](https://www.drupal.org/project/simple_oauth). After obtaining a
token, Publisher calls `POST <tokenHost>/publisher/access` and grants access on
a 200 response.

`grantType` takes `0` (Authorization Code, recommended) or `1` (Resource Owner
Password, credentials sent through a basic auth challenge). The enum is not
exported, so use the number.

```ts
export default defineConfig({
  // ...
  oAuth2: {
    clientId: process.env.PUBLISHER_OAUTH2_CLIENT_ID || 'publisher',
    clientSecret: process.env.PUBLISHER_OAUTH2_CLIENT_SECRET || 'publisher',
    scope: 'publisher',
    tokenHost:
      process.env.PUBLISHER_OAUTH2_TOKEN_HOST || 'http://127.0.0.1:8888',
    tokenPath: '/oauth/token',
    grantType: 0,
    // Authorization Code only.
    authorizePath: '/oauth/authorize?response_type=code',
    sessionSecret: process.env.PUBLISHER_OAUTH2_SESSION_SECRET,
    environmentType: process.env.PUBLISHER_OAUTH2_ENVIRONMENT_TYPE,
  },
});
```

Authorization Code specifics:

- The OAuth2 client redirect URI must be `<publisher url>/oauth/callback`.
- `sessionSecret` signs the session cookie. Random per process if omitted.
- `environmentType: 'production'` enables secure cookies and trusts the first
  proxy.
- `ENCRYPTION_KEY` (environment) encrypts the tokens stored in the session.
  Random per process if unset, so sessions do not survive a restart.

### Slack notifications

Sent on build errors, on the first successful build, and on the first success
after a failure. Configure `slackNotifications` in the config, or set the
environment variables it falls back to:

- `PUBLISHER_SLACK_WEBHOOK` and `PUBLISHER_SLACK_CHANNEL` (both required).
- `PUBLISHER_URL`: adds a link to the status page.
- `LAGOON_PROJECT`, `LAGOON_ENVIRONMENT`: added to the message.

## Dependencies

- Used by: `apps/publisher`.
- OAuth2 relies on the `/publisher/access` route of the `silverback_gatsby`
  Drupal module (`@amazeelabs/silverback-gatsby`), which checks the
  `access publisher` permission.
