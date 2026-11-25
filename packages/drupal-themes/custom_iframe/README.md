# Custom iframe (`custom_iframe`)

Theme for Drupal pages embedded as iframes in the website, such as webforms.
Sub-theme of `silverback_iframe_theme`: the `silverback_iframe` module switches
to it when the URL contains `iframe=true`.

It attaches `/iframe.css`, the iframe stylesheet built by `@custom/ui` from
`packages/ui/src/iframe.css` and symlinked to `apps/cms/web/iframe.css`. Add
`no_css=true` to the URL to render without it.

`packages/drupal-themes` is symlinked to `apps/cms/web/themes/custom`.

## Configuration

The content, messages and page title blocks are placed through exported config
(`block.block.custom_iframe_*`).

## Dependencies

- Depends on: `silverback_iframe_theme`, `silverback_iframe`.
