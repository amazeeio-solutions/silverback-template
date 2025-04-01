<?php

use Drupal\locale\Gettext;

/**
 * Implements hook_post_update_NAME().
 */
function custom_post_update_import_string_translations() {
  /** @var \Drupal\Core\Extension\ModuleExtensionList $modules */
  $modules = \Drupal::service('extension.list.module');

  Gettext::fileToDatabase(
    (object)[
      'langcode' => 'de',
      'uri' => $modules->getPath('custom') . '/translations/de.po',
    ],
    [
      'customized' => LOCALE_CUSTOMIZED,
    ]
  );
}

function custom_post_update_migrate_gatsby_to_website_context() {
  $database = \Drupal::database();
  // Make sure we do not have any "website" strings, as they would just be
  // duplicates for "gatsby".
  $database->delete('locales_source')
    ->condition('context', 'website')
    ->execute();
  // Mark all the "gatsby" strings as "website".
  $database->update('locales_source')
    ->fields(['context' => 'website'])
    ->condition('context', 'gatsby')->execute();
}
