<?php

namespace Drupal\custom;

use Drupal\graphql_directives\Api;

/**
 * Helper service to retrieve menu translations.
 */
class Menus {

  /**
   * Get translations for a menu.
   *
   * @param \Drupal\graphql_directives\Api $input
   *
   * @return array
   *
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   */
  public function getMenuTranslations(Api $api): array {
    $menu = \Drupal::entityTypeManager()->getStorage('menu')->load($api->args['menu_id']);
    $languages = \Drupal::languageManager()->getLanguages();
    $translations = [];
    foreach ($languages as $language) {
      $translation = clone $menu;
      $translation->set('langcode', $language->getId());
      $translations[] = $translation;
    }
    return $translations;
  }

}
