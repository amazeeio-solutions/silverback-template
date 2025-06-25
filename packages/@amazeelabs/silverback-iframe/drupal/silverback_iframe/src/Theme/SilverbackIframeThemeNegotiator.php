<?php

namespace Drupal\silverback_iframe\Theme;

use Drupal\Core\Extension\ThemeExtensionList;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\Theme\ThemeNegotiatorInterface;

/**
 * Theme negotiator for Silverback iframe functionality.
 */
class SilverbackIframeThemeNegotiator implements ThemeNegotiatorInterface {

  /**
   * The theme extension list service.
   */
  protected ThemeExtensionList $themeExtensionList;

  public function __construct(ThemeExtensionList $themeExtensionList) {
    $this->themeExtensionList = $themeExtensionList;
  }

  /**
   * {@inheritdoc}
   */
  public function applies(RouteMatchInterface $route_match) {
    return silverback_iframe_theme_enabled();
  }

  /**
   * {@inheritdoc}
   */
  public function determineActiveTheme(RouteMatchInterface $route_match) {
    $themes = $this->themeExtensionList->getAllInstalledInfo();
    foreach ($themes as $theme => $info) {
      if (($info['base theme'] ?? NULL) === 'silverback_iframe_theme') {
        return $theme;
      }
    }
    return isset($themes['silverback_iframe_theme'])
      ? 'silverback_iframe_theme'
      : NULL;
  }

}
