# Shared Amazee Labs packages

Packages in this directory are published to NPM.

When a new project is created from `silverback-template`, the [INIT](../init)
script will:

- remove the shared packages
- re-link the shared packages from NPM

## Requirements for packages

`package.json` must meet the following criteria:

- `name` must start with `@amazeelabs/`
- `version` must present
- `private` must not present, or be `false`
- `publishConfig` should be `{ "access": "public" }`

If a package includes a Drupal modules or theme, they must be placed under
`drupal` subdir (e.g. `packages/@amazeelabs/my-package/drupal/my_module`). Then
it's easy to link them from Drupal (see `repositories` in
`apps/cms/composer.json`).

When adding a new package, make sure:

- It uses `prep` script to build the package (not `build`)
- It has proper `turbo.json`
- It has `.npmignore` (otherwise npm will use `.gitignore` and won't publish the
  built code)

## Maintenance

When a package is no longer needed for `silverback-template`, it should be
removed from this repository and maintained elsewhere.
