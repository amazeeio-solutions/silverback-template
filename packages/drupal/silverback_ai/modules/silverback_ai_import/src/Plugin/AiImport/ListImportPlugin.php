<?php

namespace Drupal\silverback_ai_import\Plugin\AiImport;

use Drupal\Core\Plugin\PluginBase;
use Drupal\silverback_ai_import\AiImportPluginManagerInterface;

/**
 * Provides a default gutenberg block converter plugin.
 *
 * @Plugin(
 *   id = "ai_list",
 *   label = @Translation("Default list convert plugin"),
 *   weight = 0,
 * )
 */
class ListImportPlugin extends PluginBase implements AiImportPluginManagerInterface {

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
    return $this->t('List converter, markdown into Gutenberg block.');
  }

  /**
   * {@inheritDoc}
   */
  public function getSchema() {
    return [
      'listItems' => 'string, html markup',
    ];
  }

  /**
   * {@inheritDoc}
   */
  public function getTemplate() {
    $config = $this->configuration;
    $chunk = $config['chunk'];

    if (isset($chunk['ordered'])
      && $chunk['ordered'] == TRUE) {
      return <<<EOD
      <!-- wp:list {"ordered":true} -->
      listItems
      <!-- /wp:list -->
      EOD;
    }

    return <<<EOD
      <!-- wp:list -->
      listItems
      <!-- /wp:list -->
    EOD;
  }

  /**
   * {@inheritDoc}
   */
  public function matches(array $chunk) {
    return $chunk['type'] == 'List';
  }

  /**
   * {@inheritDoc}
   */
  public function convert(array $chunk) {

    $html = $chunk['htmlValue'];
    $html = str_replace(["\r", "\n"], '', $html);

    $data['listItems'] = $html;

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
