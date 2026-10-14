# Gutenberg Blocks (`gutenberg_blocks`)

Adds the project's `custom/*` blocks to the Gutenberg editor, plus editor
customizations. Each block maps to a `@custom/schema` type through
`@type(id: "custom/<name>")`, and the website renders it with `@custom/ui`
components.

Editor customizations:

- Preview button with device sizes, using `silverback_external_preview`.
- Open webforms passed to the form block (`drupalSettings`).
- The `edit gutenberg html` permission enables "Edit as HTML" and the code
  editor.
- Some core formats, block options and `core/group` are removed.
- Editor styles from `@custom/ui` (`/gutenberg.css`, symlinked to
  `apps/cms/web/gutenberg.css`).

## Usage

Blocks are TypeScript files in `js/blocks`, bundled by Vite from `js/index.ts`
to `dist/gutenberg_blocks.umd.js`:

```bash
pnpm prep # build once
pnpm dev  # rebuild on change
```

To add a block:

1. Create `js/blocks/<name>.tsx`, using an existing block as a starting point,
   or generate it from a GraphQL type of `@custom/schema`:
   `pnpm gutenberg:generate <GraphQLType>`.
2. Import it in `js/index.ts`.
3. Build, then clear the Drupal cache if needed.

Blocks listed under `dynamic-blocks` in `gutenberg_blocks.gutenberg.yml` render
in Drupal with `templates/gutenberg-block--custom--<name>.html.twig`.

Block icons: [Dashicons](https://developer.wordpress.org/resource/dashicons/).

### Validation

Validator plugins live in `src/Plugin/Validation/GutenbergValidator` (accordion,
accordion item, info grid, quote). See the `silverback_gutenberg` README for the
plugin API. On the client side, inner blocks can be limited by hiding the
`InnerBlocks` appender once `getBlockCount()` reaches the limit.

## Dependencies

- Depends on: `gutenberg` (patched), `silverback_gutenberg`, `custom`
  (`custom.media_links` service for CTA media links).
- Uses: `silverback_external_preview`, `webform`.
