# Silverback Iframe Module
The Silverback Iframe module provides a way to embed iframes in your Drupal website into the frontend.
This module makes some adjustments to allow better integration with Silverback framework.

## Installation

1. Download the module:
   ```bash
   composer require drupal/silverback_iframe
   ```
2. Enable the module:
   ```bash
    drush en silverback_iframe -y
    ```
3. Clear the cache:
   ```bash
   drush cr
   ```

## Usage

If you add the `iframe=true` flag to the URL of your Drupal site, it will render the page ready for use inside an iframe.

## Webforms

You can use the Silverback Iframe module with webforms. To do this, you need to add the `iframe=true` query parameter to the webform URL.
For example:
```
https://example.com/form/my-webform?iframe=true
```

Webform has some features that get lost when using the iframe mode.
For example the ability to know which page a webform is being submitted from, when using the `iframe=true` query parameter, the webform will not be able to determine the page it is being submitted from.

However, to get around this you can use the `ref` query to pass a base64 encoded URL of the page you are submitting the webform from.
For example:
```
https://example.com/form/my-webform?iframe=true&ref=aHR0cHM6Ly9leGFtcGxlLmNvbS9wYWdlL3Bvc3QtbW9kZQ==
```
This will tell the webform module that the webform is being submitted from the page `https://example.com/page/post-mode`.

If for some reason you need to tell the silverback iframe module that the page it is loading is a webform, you can create set a custom request attribute of `silverback_iframe_webform_id` passing the webform ID.
For example, if your webform ID is `my-webform`, you can set the request attribute like this:
```php
$request->attributes->set('silverback_iframe_webform_id', 'my-webform');
```
This will allow the Silverback Iframe module to recognize that the page is a webform and apply any necessary adjustments.
This is most useful via a custom event subscriber that listens to the `kernel.request` event and sets the attribute based on the request.
For example:
```php
namespace Drupal\my_module\EventSubscriber;
use Drupal\Core\EventSubscriber\HttpKernelSubscriberBase;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;

class MyWebformSubscriber extends HttpKernelSubscriberBase {
  public static function getSubscribedEvents() {
    $events[KernelEvents::REQUEST][] = ['onRequest', 100];
    return $events;
  }

  public function onRequest(RequestEvent $event) {
    $request = $event->getRequest();
    if ($request->attributes->get('_route') === 'custom.form.page') {
      $request->attributes->set('silverback_iframe_webform_id', 'my-webform');
    }
  }
}
```

Lastly use can use the `debug` query parameter to enable debug mode for the webform.
When debug mode is enabled, when using the `ref` query will use watchdog to log what is going on with the lookup of the ref URL.
This is useful for debugging issues with the webform submission.
For example:
```
https://example.com/form/my-webform?iframe=true&ref=aHR0cHM6Ly9leGFtcGxlLmNvbS9wYWdlL3Bvc3QtbW9kZQ==&debug=true
```
