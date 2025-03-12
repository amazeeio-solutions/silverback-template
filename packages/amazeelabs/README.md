# Shared Amazee Labs packages

Packages from this folder are published to NPM.

When a new project is created from `silverback-template`, the INIT script

- removes the shared packages
- re-links the shared packages from NPM

## Requirements

The packages should meet certain criterias:

- The package name should start with `@amazeelabs/`
- The `package.json` should have `version` property
- The `package.json` should NOT have `private` property
