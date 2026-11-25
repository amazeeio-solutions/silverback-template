# @custom/webform-export

Exports Drupal webforms to the UI package for styling. A Playwright spec opens
the `styling` webform in iframe mode, captures it in several states (idle,
validation error, terms of service modal and slideout) and saves each page with
`@amazeelabs/save-webpage`.

## Usage

```shell
pnpm webform-snapshots         # headless
pnpm webform-snapshots:headed  # with a visible browser
```

Requires an installed Drupal with test content (the `styling` webform is
imported from `@custom/test_content`). Playwright starts it with
`pnpm --filter @custom/cms start` on port 8888, or reuses a server already
running there outside CI.

Output is written to `packages/ui/static/stories/webforms/<state>/` (git
ignored), where `BlockForm` stories in `@custom/ui` load it. Style the forms in
`packages/ui/src/iframe.css`.

## Dependencies

- Depends on: `@amazeelabs/save-webpage`; a running `@custom/cms`.
- Used by: `@custom/ui` (Storybook webform stories).
