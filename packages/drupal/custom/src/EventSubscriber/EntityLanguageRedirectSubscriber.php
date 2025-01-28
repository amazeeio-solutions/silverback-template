<?php

namespace Drupal\custom\EventSubscriber;

use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\Language\LanguageInterface;
use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\Routing\TrustedRedirectResponse;
use Drupal\Core\Url;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;

class EntityLanguageRedirectSubscriber implements EventSubscriberInterface {

  protected LanguageManagerInterface $languageManager;

  protected RouteMatchInterface $routeMatch;

  public function __construct(LanguageManagerInterface $language_manager, RouteMatchInterface $route_match) {
    $this->languageManager = $language_manager;
    $this->routeMatch = $route_match;
  }

  public static function getSubscribedEvents() {
    // We need this subscriber to run after the router_listener service (which
    // has priority 32) so that the parameters are set into the request, but
    // before the EntityCanonicalViewSubscriber one (with the priority 28). So,
    // we set the priority to 30.
    return [
      KernelEvents::REQUEST => [
        ['onKernelRequest', 30],
      ]
    ];
  }

  public function onKernelRequest(RequestEvent $event): void {
    $redirect = $this->getMissingDefaultRevisionRedirect($event)
      ?? $this->getMissingTranslationRedirect($event);
    if ($redirect) {
      // Add the necessary cache contexts to the response, as redirect
      // responses are cached as well.
      $metadata = new CacheableMetadata();
      $metadata->addCacheContexts([
        'languages:language_interface',
        'url.query_args',
        'user',
      ]);
      $redirect->addCacheableDependency($metadata);
      if ($this->routeMatch->getRouteName() === 'entity.node.canonical') {
        $node = $this->routeMatch->getCurrentRouteMatch()->getParameter('node');
        $redirect->addCacheableDependency($node);
      }

      $event->setResponse($redirect);
    }
  }

  private function getMissingTranslationRedirect(RequestEvent $event): ?TrustedRedirectResponse {
    // In case the user tries to access a node in a language entity is not
    // translated to, we redirect to the entity in the original language and
    // display a warning message.
    if ($this->routeMatch->getRouteName() === 'entity.node.canonical') {
      $entity = $this->routeMatch->getCurrentRouteMatch()->getParameter('node');
      $requestedLanguageId = $this->languageManager->getCurrentLanguage(LanguageInterface::TYPE_CONTENT)->getId();
      if ($entity->language()->getId() != $requestedLanguageId) {
        $routeOptions = [
          'language' => $entity->language(),
        ];
        $routeParameters = [
          'node' => $entity->id(),
        ];
        $url = Url::fromRoute('entity.node.canonical', $routeParameters, $routeOptions);
        // Make sure we keep any query strings.
        $queryString = (string) $event->getRequest()->getQueryString();
        if ($queryString !== '') {
          $queryString .= '&';
        }
        $urlString = $url->toString() . '?' . $queryString . 'content_language_not_available=true&requested_language=' . $requestedLanguageId;

        return new TrustedRedirectResponse($urlString);
      }
    }

    return NULL;
  }

  private function getMissingDefaultRevisionRedirect(RequestEvent $event): ?TrustedRedirectResponse {
    // This spaghetti code detects if user is trying to view a translation that
    // is a draft only and does not have a published revision on the canonical
    // route.
    // Why do we do it: The content translation overview page links to
    // `/{lang}/node/{nid}`, but in the case mentioned above, the canonical
    // route displays the content in the original language. Which is quite
    // confusing.
    if ($this->routeMatch->getRouteName() === 'entity.node.canonical') {
      $entity = $this->routeMatch->getCurrentRouteMatch()->getParameter('node');
      $requestedLanguageId = $this->languageManager->getCurrentLanguage(LanguageInterface::TYPE_CONTENT)->getId();
      if ($entity->language()->getId() != $requestedLanguageId) {
        $storage = \Drupal::entityTypeManager()->getStorage('node');
        $latestRevisionId = $storage->getLatestTranslationAffectedRevisionId($entity->id(), $requestedLanguageId);
        if ($latestRevisionId) {
          /** @var \Drupal\Core\Entity\ContentEntityInterface $latestRevision */
          $latestRevision = $storage->loadRevision($latestRevisionId);
          $translations = $latestRevision->getTranslationLanguages();
          if (array_key_exists($requestedLanguageId, $translations)) {
            $latestRevision = $latestRevision->getTranslation($requestedLanguageId);
            // Bingo! We found the target case. Redirect to the latest revision.
            if ($latestRevision->access('view')) {
              $url = $latestRevision->toUrl('latest-version')->toString();
              return new TrustedRedirectResponse($url);
            }
          }
        }
      }
    }
    return NULL;
  }

}
