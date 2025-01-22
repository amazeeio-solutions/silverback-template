<?php

namespace Drupal\silverback_ai_import\Plugin\AiImport;

use Drupal\Core\Plugin\PluginBase;
use Drupal\silverback_ai_import\AiImportPluginManagerInterface;

/**
 * Provides a default gutenberg block converter plugin.
 *
 * @Plugin(
 *   id = "ai_default",
 *   label = @Translation("Default convert plugin"),
 *   weight = 0,
 * )
 */
class DefaultImportPlugin extends PluginBase implements AiImportPluginManagerInterface {

  /**
   * The schema to use.
   *
   * @var array
   */
  private array $schema = [];

  /**
   * The template to use.
   *
   * @var string
   */
  private string $template;

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
    $this->schema = $this->getSchema();
    $this->template = $this->getTemplate();
  }

  /**
   * Get a description if the plugin.
   */
  public function description() {
    return $this->t('Default converter, just throws the html into Gutenberg blocks.');
  }

  /**
   * {@inheritDoc}
   */
  public function getSchema() {
    return [
      'htmlValue' => 'string, html markup',
    ];
  }

  /**
   * {@inheritDoc}
   */
  public function getTemplate() {
    return <<<EOD
    <!-- wp:paragraph -->
    htmlValue
    <!-- /wp:paragraph -->
    EOD;
  }

  /**
   * {@inheritDoc}
   */
  public function matches(array $chunk) {
    // This should not much by default.
    return FALSE;
  }

  /**
   * {@inheritDoc}
   */
  public function convert(array $chunk) {
    // We are using some custom method here.
    $data['htmlValue'] = $chunk['htmlValue'];
    return $this->generateBlock($data);
  }

  /**
   * {@inheritDoc}
   */
  public function generateBlock(array $data): string {
    // Validate required keys.
    $required_keys = array_keys($this->getSchema());
    $template = $this->getTemplate();
    foreach ($required_keys as $key) {
      if (!isset($data[$key])) {
        throw new \InvalidArgumentException("Missing required key: {$key}");
      }
    }

    // Create replacement pairs.
    foreach ($required_keys as $key) {
      $replacements[$key] = $data[$key];
    }

    // Perform replacements.
    foreach ($replacements as $key => $value) {
      $template = str_replace($key, $value, $template);
    }

    return $template;
  }
}
