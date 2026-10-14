# Test content (`test_content`)

Holds the default content and webforms of local and test environments: entities
in `content/` (exported by the `default_content` module) and webform config in
`webforms/`. Imported on every Drupal install (`pnpm drupal-install` in
`apps/cms`), so the e2e tests rely on it.

The module itself is not meant to be enabled: its `hook_requirements()` reports
an error when it is.

## Usage

Change content in the Drupal UI, then export it from `apps/cms`:

```bash
pnpm content:export
```

`export.php` replaces `content/` with all content entities, except path aliases,
moderation states, redirects, webform submissions, OAuth consumers and Search
API tasks. It also drops generic media icons and writes all webforms to
`webforms/`. Never edit the exported files by hand.

To import into an existing site:

```bash
pnpm content:import
```

`import.php` imports `content/`, creates the webforms and adds a German
translation for the `Company name` string (`website` context), used by tests.

## Dependencies

- Depends on: `default_content`, `@amazeelabs/default-content` (export and
  import helpers), `webform`.
- `custom` alters the exported fields.
