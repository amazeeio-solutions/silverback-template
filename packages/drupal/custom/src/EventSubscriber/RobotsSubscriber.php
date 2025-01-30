<?php

declare(strict_types=1);

namespace Drupal\custom\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Prevents any Drupal page to be indexed by search engines.
 *
 * Additional measure as robots.txt could be overridden by a scaffold process.
 */
final class RobotsSubscriber implements EventSubscriberInterface {

  /**
   * Kernel response event handler.
   */
  public function onKernelResponse(ResponseEvent $event): void {
    $response = $event->getResponse();
    $response->headers->set('X-Robots-Tag', 'noindex, nofollow');
  }

  /**
   * {@inheritdoc}
   */
  public static function getSubscribedEvents(): array {
    return [
      KernelEvents::RESPONSE => ['onKernelResponse'],
    ];
  }

}
