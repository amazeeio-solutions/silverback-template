<?php

namespace Drupal\silverback_iframe\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;

class SilverbackIframeEventSubscriber implements EventSubscriberInterface {

  public function onKernelResponse(ResponseEvent $event) {
    if (silverback_iframe_theme_enabled()) {
      $response = $event->getResponse();
      $response->headers->remove('X-Frame-Options');

      $request = $event->getRequest();
      if ($request->query->has('ref')) {
        $refValue = $request->query->get('ref');

        // Add a Vary header properly
        $vary = $response->headers->get('Vary', '');
        $varyHeaders = $vary ? array_map('trim', explode(',', $vary)) : [];
        if (!in_array('ref', $varyHeaders)) {
          $varyHeaders[] = 'ref';
          $response->headers->set('Vary', implode(', ', $varyHeaders));
        }

        // Set cache context properly
        if (method_exists($response, 'getCacheableMetadata')) {
          $response->getCacheableMetadata()->addCacheContexts(['url.query_args:ref']);
        }

        // For debugging
        $response->headers->set('X-Ref-Source', $refValue);
      }
    }
  }

  public static function getSubscribedEvents() {
    $events[KernelEvents::RESPONSE][] = ['onKernelResponse', -10];
    return $events;
  }

}
