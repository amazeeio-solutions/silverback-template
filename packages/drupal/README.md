# Custom Drupal modules

Home of the project's custom Drupal modules. This directory is symlinked to
`apps/cms/web/modules/custom`.

Custom themes live in [`packages/drupal-themes`](../drupal-themes), symlinked to
`apps/cms/web/themes/custom`. Contrib modules checked out for local work go to
[`packages/drupal-local`](../drupal-local/README.md).

## Modules

- [`content_preview`](content_preview/README.md): lets the preview role view
  unpublished content.
- [`custom`](custom/README.md): site-specific customizations and GraphQL
  directives.
- [`custom_heavy`](custom_heavy/README.md): runs `custom_form_alter()` after all
  other form alters.
- [`entity_create_split`](entity_create_split/README.md): two-step entity
  creation form.
- [`gutenberg_blocks`](gutenberg_blocks/README.md): custom Gutenberg blocks and
  editor customizations.
- [`search_api_global`](search_api_global/README.md): Search API results in the
  Coffee admin search.
- [`test_content`](test_content/README.md): default content and webforms for
  local and test environments.

## Rules

Each module is a pnpm workspace package and has a `package.json` file. Minimal
contents:

```json
{
  "name": "@custom/<MODULE_NAME>",
  "version": "1.0.0",
  "private": true
}
```

Copy the `scripts` and `turbo.json` of an existing module to include it in the
static analysis and PHPUnit tasks.

Each module should be declared as a dependency of the `apps/cms` package
(`"@custom/<MODULE_NAME>": "workspace:*"`).
