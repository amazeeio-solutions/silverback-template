# Shared Amazee Labs packages

Packages in this directory are published to NPM.

When a new project is created from `silverback-template`, the [INIT](../init)
script:

- removes the shared packages
- re-links the shared packages from NPM

## Requirements for packages

Packages `package.json` must meet the following criteria:

- `name` must start with `@amazeelabs/`
- must include a `version` property
- must NOT have a `private` property

When adding a new package, make sure

- It uses `prep` script to build the package (in `silverback-mono` the default
  build script was called `build`)
- It has proper `turbo.json`
- It has `.npmignore` (otherwise npm will use `.gitignore` and won't publish the
  build)

## Maintenance

When a package is no longer needed for `silverback-template`, it should be
removed from this repository and maintained in a separate repository.
