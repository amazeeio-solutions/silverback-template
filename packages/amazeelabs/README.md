# Shared Amazee Labs packages

Packages in this directory are published to NPM.

When a new project is created from `silverback-template`, the [INIT](../init)
script:

- removes the shared packages
- re-links the shared packages from NPM

## Requirements

Packages `package.json` must meet the following criteria:

- `name` must start with `@amazeelabs/`
- must include a `version` property
- must NOT have a `private` property

## Maintenance

When a package is no longer needed for `silverback-template`, it should be
removed from this repository and maintained in a separate repository.
