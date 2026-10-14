# Silverback Iframe (Drupal module)

Renders Drupal pages for display in the `SilverbackIframe` React component of
`@amazeelabs/silverback-iframe`.

## Installation

```bash
composer require amazeelabs/silverback_iframe amazeelabs/silverback_iframe_theme
drush en silverback_iframe -y
drush theme:install silverback_iframe_theme -y
```

The webform integration requires the `webform` module, and redirect
confirmations use the `LinkProcessor` service of `silverback_gutenberg`.

## Usage

When the URL contains `iframe=true`, the module:

- Switches to `silverback_iframe_theme`, or to an installed sub-theme of it.
- Removes the `X-Frame-Options` response header and the toolbar.
- Adds `iframe=true` to all outbound URLs.
- Attaches the iframe-resizer content window script and `js/iframeCommand.js`.
  The script sends commands to the parent frame and rewrites visible links to
  the parent base URL, without `iframe=true`, targeting the parent frame.

With the `SB_ENVIRONMENT` environment variable set, `iframe_resizer=true`
attaches the scripts without switching the theme.

## Webforms

In iframe mode, webform confirmation types are handled as follows:

- URL: redirects the parent page.
- URL with message: redirects the parent page and passes the message.
- Message: displays the message above the form. If the message contains an
  element with the `js-iframe-parent-message` class, the webform default
  applies.
- None: does nothing.
- Inline and any other type: scrolls to the top and replaces the iframe with the
  message.

Set `limit_webform_confirmation_options` in `silverback_iframe.settings` to
`true` to only offer these types in the webform confirmation settings form.

### Source entity

In an iframe, webform cannot detect the page the form is submitted from. The
`silverback_iframe_query_string` source entity plugin resolves it from the `ref`
query parameter, a base64 encoded URL of the parent page, which the React
component sets automatically. It falls back to the HTTP referer. Only node pages
are resolved.

```
https://example.com/form/my-webform?iframe=true&ref=aHR0cHM6Ly9leGFtcGxlLmNvbS9wYWdlL3Bvc3QtbW9kZQ==
```

If the webform is not a route parameter, e.g. on a custom form page, set the
`silverback_iframe_webform_id` request attribute:

```php
namespace Drupal\my_module\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;

class MyWebformSubscriber implements EventSubscriberInterface {

  public static function getSubscribedEvents(): array {
    return [KernelEvents::REQUEST => 'onRequest'];
  }

  public function onRequest(RequestEvent $event): void {
    $request = $event->getRequest();
    if ($request->attributes->get('_route') === 'custom.form.page') {
      $request->attributes->set('silverback_iframe_webform_id', 'my-webform');
    }
  }

}
```

Add `debug=true` to the URL to log each step of the source entity lookup to the
`silverback_iframe` logger channel.
