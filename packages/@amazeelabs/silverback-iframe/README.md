# Silverback Iframe

Allow embed Drupal pages (mainly forms) to React frontend.

For example, Drupal webforms can be integrated to the frontend. Most of the
confirmation types are supported, so
`URL with message (redirects to a custom path or URL and displays the confirmation message at the top of the page)`
option will do exactly what it promises.

## Installation

Drupal:

- `composer require amazeelabs/silverback_iframe amazeelabs/silverback_iframe_theme`
- `drush en silverback_iframe`
- `drush then silverback_iframe_theme`
- If needed: create a custom theme based on `silverback_iframe_theme` and enable
  it
- Configure which blocks to display with `silverback_iframe_theme` (or your
  sub-theme) at `/admin/structure/block`

React frontend:

- `pnpm add @amazeelabs/silverback-iframe`
- Use `SilverbackIframe` component

## Parts

### JS package

Exports `SilverbackIframe` component which is an extended version of
[iframe-resizer-react](https://www.npmjs.com/package/iframe-resizer-react).

The component

- automatically adds `iframe=true` param to the iframe src
- receives commands from Drupal, e.g. `redirect`, `displayMessages`, etc
- sends parent frame base URL to Drupal

### Drupal module

(`drupal/silverback_iframe`)

If there is `iframe=true` param in the URL, the module does:

- Enables `silverback_iframe_theme`.
- Removes `X-Frame-Options` header.
- Adds `iframe=true` param to all outbound URLs.
- adds [iframe-resizer](https://www.npmjs.com/package/iframe-resizer) library to
  all pages
- adds `iframeCommand.js` to all pages, the script
  - passes iframe commands to the parent frame
  - updates all visible links:
    - they should point to the parent frame base url
    - they should contain no `iframe=true` parameter
    - they should target parent frame

### Drupal theme

(`drupal/silverback_iframe_theme`)

The theme displays main content without any surroundings.

If you need to add CSS or
[`libraries-override`](https://www.drupal.org/node/2216195#override-extend),
create a sub-theme. Then the `silverback_iframe` module will use the sub-theme
instead of `silverback_iframe_theme`.
