# Entity Create Split (`entity_create_split`)

Splits entity creation into two steps. The first step shows only the fields of
the `split` form mode and creates the entity on submit. The user is then
redirected to the regular edit form for the remaining fields.

## Configuration

Create a form mode with the machine name `split` and enable it on the bundle.
The `node.add` and `media.add` routes of that bundle then redirect to
`/entity/create/{entity_type}/{bundle}`. The template enables it for the `page`
content type.

Gutenberg is disabled on the first step through `hook_gutenberg_enabled()`. That
hook comes from the "Gutenberg enabled hook" patch
([#3445677](https://www.drupal.org/project/gutenberg/issues/3445677)) applied to
`drupal/gutenberg` in `apps/cms/composer.json`. Without the patch, the split
form still works but keeps the Gutenberg form alterations.

## Dependencies

- Works with: `gutenberg` (patched).
