<?php

/**
 * @file
 * Import translation strings from the ui package.
 */

/**
 * The translations processor for importing.
 *
 * @var \Drupal\silverback_translations\TranslationsProcessorInterface $processor.
 */
$processor = \Drupal::service('silverback_translations.json_processor');
$sources = file_get_contents('../node_modules/@custom/ui/build/translatables.json');
$processor->createSources($sources, 'website');
