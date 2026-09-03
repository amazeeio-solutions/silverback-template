# Silverback Template

## Create a new project from this template

Minimum steps

- https://github.com/amazeeio-solutions/silverback-template >
  `Use this template` > `Create a new repository`
- In the newly created repo
  - Settings > Manage access > Collaborators and teams
    - add `Tech Team` with `Admin` role
    - remove yourself
  - Settings > General > Pull Requests
    - Enable `Allow merge commits`, disable other merge options
    - Enable `Automatically delete head branches`
- Clone the newly create repo
- Run `pnpm i && pnpm --filter @custom/init run init` from the project root
- Answer its questions
- Review the changes in the repo
- Commit and push

Other steps

- [Create a new Lagoon project](https://amazeelabs.atlassian.net/wiki/spaces/ALU/pages/368115717/Create+a+new+Lagoon+project)
- [Create a new Netlify project](https://amazeelabs.atlassian.net/wiki/spaces/ALU/pages/368017428/Create+a+new+Netlify+project)
- Check the [Environment overrides](#environment-overrides) section below
- Check the [Statistics and Estimations](#statistics-and-estimations) section
  below
- Check the [Choose a CMS](#choose-a-cms) section below
- Create `dev` and `prod` branches (and optionally `stage`) from `release`

## Connect to automatic estimations

There are Github workflows that can connect to the
[Amazeelabs Dashboard](https://dashboard.amazeelabs.com) to log complexity
statistics and retrieve automatic estimations. To use that, provide a
`JIRA_PROJECT_ID` environment variable in the Github repository variables.

The project should then show up on
[Estimator page](https://dashboard.amazeelabs.com/estimator).

## Choose a CMS

The template comes with Drupal and Decap CMS enabled by default. To disable
either (or both), follow these two steps:

1. Remove the dependencies to `@custom/cms`/`@custom/decap` from
   `apps/website/package.json`
2. Remove the `@custom/cms`/`@custom/decap` plugins from
   `apps/website/gatsby-config.mjs`

## Branches and environments

<table>
<thead>
  <tr>
    <th rowspan="2">Branch name</th>
    <th rowspan="2">Connected environment</th>
    <th colspan="2">Purpose </th>
  </tr>
  <tr>
    <th>Pre Go Live</th>
    <th>Post Go Live</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td><code>release</code></td>
    <td>(none)</td>
    <td colspan="2">Contains everything that is approved for PROD deployment</td>
  </tr>
  <tr>
    <td><code>prod</code></td>
    <td>PROD</td>
    <td colspan="2">The production environment</td>
  </tr>
  <tr>
    <td><code>dev</code></td>
    <td>DEV</td>
    <td>Sandbox/playground, no client data, anyone can merge anything</td>
    <td>Sandbox/playground, with client data, main testing environment</td>
  </tr>
  <tr>
    <td><code>stage</code></td>
    <td>STAGE</td>
    <td>Second sandbox with client data and automated merge from <code>dev</code> to <code>stage</code>, regular data sync</td>
    <td>Second sandbox for bigger features that need a clean set up or would prevent other normal tasks from being performed while working on it. With client data. No automated merges from <code>dev</code>.</td>
  </tr>
  <tr>
    <td><code>lagoon-*</code></td>
    <td>(same as branch name)</td>
    <td colspan="2">Can be created for big, long-term feature developments. Use wisely<br>  as it creates additional costs.</td>
  </tr>
</tbody>
</table>

## Development workflow

- Create a new branch from `release` and commit your work in
- Create a PR against `release`
- Merge your branch to `dev` for testing
- Testing feedback is committed to the branch and merged back to `dev` for
  retesting
- When the PR is approved and Jira ticket gets to the Deploy state, the branch
  is merged to `release`
  - Please note, this does not trigger an actual PROD deployment
- PROD deployment can be done by merging `release` branch into `prod`

## Pre-commit Quality Checks

The project includes a comprehensive pre-commit system to catch errors and
maintain code quality before CI. This system automatically fixes formatting
issues, reports unfixable problems, and runs unit tests across all packages.

### Available Commands

From the project root:

```bash
# Run all pre-commit checks (fix, validate, test)
pnpm precommit

# Only run auto-fixing for formatting and linting
pnpm precommit:fix

# Only run validation without fixing
pnpm precommit:check
```

### What It Does

- **Auto-fixes formatting** with Prettier (TypeScript/JavaScript) and PHPCBF
  (PHP)
- **Auto-fixes linting issues** with ESLint (where possible)
- **Reports unfixable issues** with clear error messages and line numbers
- **Runs unit tests** across all packages (Vitest for TypeScript, PHPUnit for
  PHP)
- **Provides fast feedback** for both developers and AI tools

### Integration

This system is designed to:

- Catch avoidable errors before CI runs
- Provide immediate feedback during development
- Automatically maintain consistent code style
- Work seamlessly with AI development tools

The pre-commit checks leverage Turborepo's caching system for optimal
performance, typically achieving 80%+ cache hit rates on subsequent runs.

## Installation

Tip: The easiest way to set up a working environment for the project is
[devbox](docs/devbox.md).

Install dependencies and prepare packages:

```
pnpm i
pnpm turbo:prep
```

Tip: Run `pnpm turbo:prep:force` after switching branches to avoid issues.

## Working with apps and packages

Navigate to an app/package folder and run `pnpm dev`.

When working on integration tasks, it may be required to re-run
`pnpm turbo:prep` from the repo root.

More info on Turborepo: [docs/turborepo.md](docs/turborepo.md).

### Drupal

Running `pnpm turbo:prep` works conditionally for Drupal. If database exists, it
clears Drupal cache. Otherwise, it re-installs Drupal completely.

If you wish Drupal to be re-installed, run `pnpm turbo:prep:force`.

To work on packages from drupal.org, clone them into `packages/drupal-local`.
They will have a higher precedence than the versions downloaded by composer.

### Mailpit

Mailpit is installed by default on local development environments and catches
all Drupal outgoing emails. Available on http://localhost:8025/

## Environment overrides

The application is tailored to run locally out of the box. In a production or
hosting environment, you will need to override some of the environment
variables.

- **DRUPAL_HASH_SALT** (lagoon): Drupal's hash salt. Should be different per
  environment for security reasons.
- **PUBLISHER_URL** (lagoon): If publisher is set to a custom domain, this
  variable has to be defined.
- **GITHUB APP**: To run publisher builds, provide the credentials of a GitHub
  App that has the "actions: write" repository permission and is installed on
  this repository. Installation tokens are exempt from SSO authorization, which
  makes an app the reliable option in SSO enforced organizations.
  - **GITHUB_APP_ID** (lagoon): The ID of the app.
  - **GITHUB_APP_PRIVATE_KEY** (lagoon): The private key of the app, base64
    encoded.
  - **GITHUB_APP_INSTALLATION_ID** (lagoon): The ID of the app installation on
    this repository.
- **GH_TOKEN** or **GITHUB_TOKEN** (lagoon): A personal access token, as an
  alternative to the GitHub App above, for organizations without SSO
  enforcement. The app takes precedence when both are provided.
- **NETLIFY**: To publish the project to netlify, provide the following
  environment variables:
  - **NETLIFY_SITE_ID** (lagoon): The ID of the netlify project the
  - **NETLIFY_AUTH_TOKEN** (lagoon): The auth token for the netlify project.
  - **NETLIFY_URL** (lagoon): The URL of the netlify project.
  - **NETLIFY_STORYBOOK_ID** (github): If this is set, the UI packages storybook
    build will be published to netlify.
- **CLOUDINARY**: To use cloudinary for image processing, provide the following
  environment variables:
  - **CLOUDINARY_CLOUDNAME** (lagoon): The cloud name of the cloudinary project.
  - **CLOUDINARY_API_KEY** (lagoon): The API key of the cloudinary project.
  - **CLOUDINARY_API_SECRET** (lagoon): The API secret of the cloudinary
    project.
- **DRUPAL_INTERNAL_URL** (lagoon): The internal URL of the Drupal instance.
  This is used for the GraphQL build queries.
- **DRUPAL_EXTERNAL_URL** (lagoon): The external URL of the Drupal instance.
  This is used for the GraphQL client queries.

On lagoon for example, this should happen in `.lagoon.env` files, or directly as
lagoon runtime configuration.

```shell
lagoon add variable -p [project name] -e dev -N NETLIFY_SITE_ID -V [netlify site id]
```

### Publisher authentication with Drupal

Publisher can require to authenticate with Drupal based on OAuth2. It is only
used on Lagoon environments.

<details>
  <summary>How it works</summary>

#### Drupal configuration

##### Create keys

Per environment, keys are gitignored and are auto-generated via a Lagoon
post-rollout task.

To generate keys manually

via Drush: cd in the cms directory then

```bash
drush simple-oauth:generate-keys ./keys
```

or via the UI

- Go to `/admin/config/people/simple_oauth`
- Click on "Generate keys", the directory should be set to
  `./sites/default/files/private/keys`

##### Create the Publisher Consumer

Per environment, Consumers are content entities.

- Go to `/admin/config/services/consumer`
  - Create a Consumer
    - Label: `Publisher`
    - Client ID: `publisher`
    - Secret: a random string
    - Redirect URI: `[publisher-url]/oauth/callback`
  - Optional: the default Consumer can be safely deleted

Troubleshooting:

- make sure that the `DRUPAL_HASH_SALT` environment variable is >= 32 chars.
- if enabled on local development, use `127.0.0.1:8888` for the cms and
  `127.0.0.1:8000` for Publisher

#### Publisher authentication

Edit [website environment variables](./apps/website/.lagoon.env)

```
PUBLISHER_SKIP_AUTHENTICATION=false
PUBLISHER_OAUTH2_CLIENT_SECRET="[secret used in the Drupal Consumer]"
PUBLISHER_OAUTH2_SESSION_SECRET="[another random string]"
```

##### Set the 'Access Publisher' permission

Optional: add this permission to relevant roles.

</details>

<details>
  <summary>How to disable it</summary>

In website `.lagoon.env` set `PUBLISHER_SKIP_AUTHENTICATION=true`

</details>

## Storybook

If a `CHROMATIC_PROJECT_TOKEN` environment variable is set, the Storybook build
will be published to [Chromatic](https://www.chromatic.com/). Additionally
setting the `NETLIFY_STORYBOOK_ID` environment variable will deploy storybook to
netlify, which provides less features but is easier to access.

### Layout images

These are images that are part of the design and are therefore not uploaded by
the user. They have to be put into the `static/public` directory which is also
shared with the website application (Gatsby). Examples are logos, icons, etc. In
a component they should be rendered with a regular `<img>` tag and the `src`
relative to the `static/public` directory.

```tsx
<img src="/logo.svg" alt="Logo" />
```

### Content images

These are images that are uploaded by the user, or on some other way injected
from the outside. In production, images are handled by Cloudinary. In
development, basic cropping is simulated in the browser. The location to store
these images is the `static/stories` directory, which is used for Storybook
only.

In the GraphQL schema, these images are represented by the `ImageSource` type.
If the component requires ones of these, one should use the `image` helper from
`src/helpers/image`, which produces exactly this type. The image itself can be
imported from the `static/stories` directory using the `@stories/` alias. The
import is handled by
[`vite-imagetools`](https://github.com/JonasKruckenberg/imagetools/tree/main/packages/vite)
and has to end with `as=metadata`. It is also possible to apply transformations.

```tsx
import Teaser from './Teaser';
import TeaserImage from '@stories/teaser.jpg?as=metadata';

export const WithImage = {
  args: {
    title: 'Lorem ipsum dolor sit amet',
    image: image(TeaserImage),
  },
} satisfied StoryObj<typeof Teaser>
```

In this case, the image will retain its intrinsinc dimensions. To simulate
scaling, pass a `width` property.

```tsx
import Teaser from './Teaser';
import TeaserImage from '@stories/teaser.jpg?as=metadata';

export const WithImage = {
  args: {
    title: 'Lorem ipsum dolor sit amet',
    image: image(TeaserImage, { width: 400 }),
  },
} satisfied StoryObj<typeof Teaser>
```

The image will retain its aspect ratio. To actually crop the image, also add a
`height`.

```tsx
import Teaser from './Teaser';
import TeaserImage from '@stories/teaser.jpg?as=metadata';

export const WithImage = {
  args: {
    title: 'Lorem ipsum dolor sit amet',
    image: image(TeaserImage, { width: 400, height: 300 }),
  },
} satisfied StoryObj<typeof Teaser>
```

### Responsive images

In GraphQL fragments, it is possible to request responsive image sources.

```gql
fragment Teaser on Page {
  title
  image(width: 400, height: 300, sizes: [[1200, 800]])
}
```

The output of `image` is also of type `ImageSource`. To simulate this in
Storybook, add the same `sizes` property to the `image` helper.

```tsx
export const WithImage = {
  args: {
    title: 'Lorem ipsum dolor sit amet',
    image: image(TeaserImage, { width: 400, height: 300, sizes: [[1200, 800]]}),
  },
} satisfied StoryObj<typeof Teaser>
```

> **IMPORTANT:** If embedded this way, these images will not be visible in
> Storybook immediately. Instead, a placeholder that indicates the loaded images
> dimensions will be shown.

An approximation of the image that would be delivered by Cloudinary is embedded
when:

- On "demo" storybook builds deployed to netlify
- In Gatsby when built on Lagoon.

These Cloudinary approximations are not real images and will fail integration
tests. Therefore they are not used in regular development and testing scenarios.

## "Strangling" legacy systems

The template includes a Netlify Edge Function
(`apps/website/netlify/edge-functions/strangler.ts`) that allows to proxy
unknown requests selectively to other systems. This can be used to replace only
specific pages of a legacy system or incorporate existing business logic.

Refer to the
[Strangler Pattern](https://www.martinfowler.com/bliki/StranglerFigApplication.html)
blog post if you wonder where the name comes from, to
[Edge functions documentation](https://docs.netlify.com/edge-functions/overview/)
for technical details and to `strangler.ts` for how to add new legacy systems.

## Website preview

There is a preview app available which is basically an almost identical copy of
the public website, but it displays the most up to date content (even real time
changes done in the content edit forms). The access to the preview app is done
based on a special token that is generated, for the moment, on the content edit
form, in the CMS.

The entire preview system works like this:

- Make sure you have at least the following versions for these modules:
  - silverback_autosave: 1.3.4
  - silverback_preview_link: 1.6.12
  - silverback_gatsby: 3.7.11
  - custom content_preview module copied from this repository.
- Make sure you have defined in `settings.php` the
  `silverback_external_preview.settings.preview_host` which should point to the
  domain (and optionally port) of the preview app, for example:
  `http://127.0.0.1:8001`
- There should be a `preview` role which should have at least the
  `Access any content revision` and the `Fetch any autosaved entity`
  permissions. Make sure you also have the custom `content_preview` module
  enabled.
- There should be a user created, having the `preview` role, that will be set as
  `Default preview user` at `/admin/config/content/silverback_preview_link`
- To create a shareable preview link:
  - Open a content edit form
  - Click on the preview button which should open the preview iframe in the left
    sidebar
  - Click on the `Share preview` link. This should open a popup from where you
    can copy the preview link (or access it via the QR code).
