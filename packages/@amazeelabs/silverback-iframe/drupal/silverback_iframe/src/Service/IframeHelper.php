<?php

namespace Drupal\silverback_iframe\Service;

use Symfony\Component\HttpFoundation\RequestStack;

class IframeHelper {
  protected RequestStack $requestStack;

  public function __construct(RequestStack $requestStack) {
    $this->requestStack = $requestStack;
  }

  public function isIframeThemeEnabled(): bool {
    return $this->requestStack->getCurrentRequest()->get('iframe') === 'true';
  }

  public function shouldInjectResizer(): bool {
    if (!getenv('SB_ENVIRONMENT')) {
      return FALSE;
    }
    return $this->requestStack->getCurrentRequest()->query->get('iframe_resizer') === 'true';
  }
}