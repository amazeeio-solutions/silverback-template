# Custom Heavy (`custom_heavy`)

Keeps alter hooks of the `custom` module in the right order. It moves
`custom_form_alter()` to the end of the `hook_form_alter` implementations, and
sets its own module weight to 9999 on install.

## Dependencies

- Used by: `custom`, whose form alter moves fields into the Gutenberg sidebar
  after the other modules altered the node form.
