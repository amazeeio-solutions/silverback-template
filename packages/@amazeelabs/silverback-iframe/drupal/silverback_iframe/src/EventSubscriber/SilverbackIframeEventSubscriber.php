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

//        // TEST OPTION 1: Force no caching for these requests
//        $response->headers->set('Cache-Control', 'no-cache, no-store, must-revalidate');
//        $response->headers->set('Pragma', 'no-cache');
//        $response->headers->set('Expires', '0');
//
//        // TEST OPTION 2: Add a random cache buster (alternative approach)
//        if (method_exists($response, 'getCacheableMetadata')) {
//          $randomValue = mt_rand(1, 1000000);
//          $response->getCacheableMetadata()->addCacheContexts(['url.query_args:ref', 'random:' . $randomValue]);
//
//          // Add debug header to verify the random value is changing
//          $response->headers->set('X-Cache-Buster', $randomValue);
//        }

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