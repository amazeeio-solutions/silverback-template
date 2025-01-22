<?php

namespace Drupal\silverback_ai_import\Plugin\AiPostImport;

use Drupal\Core\Plugin\PluginBase;
use Drupal\silverback_ai_import\AiPostImportPluginManagerInterface;

/**
 * Provides a default gutenberg block converter plugin.
 *
 * @Plugin(
 *   id = "ai_empty_chunks",
 *   label = @Translation("Fllters empty chunks"),
 *   weight = 0,
 * )
 */
class EmptyChunksRemovePostImportPlugin extends PluginBase implements AiPostImportPluginManagerInterface {

  /**
   * Constructs a \Drupal\Component\Plugin\PluginBase object.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin ID for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition) {
    $this->configuration = $configuration;
    $this->pluginId = $plugin_id;
    $this->pluginDefinition = $plugin_definition;
  }

  /**
   * Get a description if the plugin.
   */
  public function description() {
    return $this->t('Filters empty chunks.');
  }

  /**
   * {@inheritDoc}
   */
  public function convert(array $chunks) {
    $chunks = array_filter($chunks, function ($item) {
      if (str_starts_with(trim($item), '<!-- wp:paragraph -->')) {
        $cleaned = $cleaned = preg_replace('/[\r\n]+/', '', strip_tags($item));
        return strlen($cleaned) > 0;
      }
      return TRUE;
    });
    return $chunks;
  }
}
