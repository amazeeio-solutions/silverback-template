# @custom/init

One-time script that turns a fresh copy of the template into a project. It
renames the project, generates new secrets and removes template-only parts. See
[Create a new project from this template](../../README.md#create-a-new-project-from-this-template)
for the overall steps.

## Usage

From the project root, right after creating the repository:

```shell
pnpm i && pnpm --filter @custom/init run init
pnpm i  # update the lock file afterwards
```

It asks for (or reads from `--project-human-name` / `--project-machine-name`):

- Project name for humans, e.g. `My Project`.
- Project machine name, e.g. `my_project` (lowercase letters, digits,
  underscores; usually the Jira project code).

Then it:

- Replaces the template names in `README.md`, `package.json`, `.lagoon.yml`,
  `.lagoon/Dockerfile`, Drupal config, Lagoon env files, publisher config and
  tests.
- Generates random OAuth2 client/session secrets in the `.lagoon.env` files of
  `cms`, `publisher` and `preview`, a new Gatsby user auth key and a new Drupal
  hash salt.
- Removes the "Create a new project" section from the root README.
- Removes `tests/e2e`, `packages/init` and the release workflows, and the init
  check step and `init_script` job from `.github/workflows/test.yml`.
- Removes `packages/@amazeelabs` after switching every `workspace:` dependency
  on those packages to `^<version>` from npm.

Run it only once: it fails if a file to rewrite or a directory to remove is
already gone. Review the changes before committing.
