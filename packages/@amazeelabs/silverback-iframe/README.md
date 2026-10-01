# @amazeelabs/silverback-iframe

Embeds Drupal pages, mainly webforms, in a React frontend through an iframe.
Contains the `SilverbackIframe` React component, the `silverback_iframe` Drupal
module and the `silverback_iframe_theme` Drupal theme.

## Usage

Drupal:

```bash
composer require amazeelabs/silverback_iframe amazeelabs/silverback_iframe_theme
drush en silverback_iframe
drush theme:install silverback_iframe_theme
```

React:

```tsx
import { SilverbackIframe } from '@amazeelabs/silverback-iframe';

<SilverbackIframe
  src="https://cms.example.com/form/contact"
  buildMessages={(messages) => <Messages messages={messages} />}
  redirect={(path, messages) => navigate(path)}
  heightCalculationMethod="lowestElement"
/>;
```

`SilverbackIframe` wraps
[iframe-resizer-react](https://www.npmjs.com/package/iframe-resizer-react) and
accepts all its props, plus:

- `buildMessages` (required): renders the HTML messages sent by Drupal.
- `redirect` (required): navigates the parent page, with optional messages.
- `scroll`: custom scroll handler. Defaults to scrolling the iframe into view.
- `cssStylesToInject`: CSS injected into the iframe. Causes a flash of unstyled
  content, so not recommended in production.

The component adds `iframe=true` and `ref` (the encoded parent page URL) to
`src`, sends the parent origin to Drupal so that links can be rewritten, and
handles the `redirect`, `displayMessages`, `replaceWithMessages` and `scroll`
commands sent by Drupal. The command types and the `isIframeCommand` type guard
are exported as well.

## Drupal module

See [drupal/silverback_iframe/README.md](drupal/silverback_iframe/README.md).

## Drupal theme

`silverback_iframe_theme` has no base theme and a single `content` region, so
iframe pages show the main content only. The module switches to it for iframe
requests; it does not need to be the default theme. Configure its blocks at
`/admin/structure/block`.

To add CSS or a
[`libraries-override`](https://www.drupal.org/node/2216195#override-extend),
create a sub-theme with `base theme: silverback_iframe_theme`. The module uses
an installed sub-theme instead of the base theme.

## Dependencies

- Depends on (Drupal module): `silverback_gutenberg`
  (`@amazeelabs/silverback-gutenberg`) for webform redirect confirmations.
- Used by: `packages/ui` (`BlockForm`) and `apps/cms`, which installs the Drupal
  module and theme from `node_modules` through a Composer path repository.
