<?php

namespace Drupal\silverback_ai_import\Plugin\AiImport;

use Drupal\Core\Plugin\PluginBase;
use Drupal\silverback_ai_import\AiImportPluginManagerInterface;

/**
 * Provides a markdown header to gutenberg block convert plugin.
 *
 * @Plugin(
 *   id = "ai_header",
 *   label = @Translation("Markdown header convert plugin"),
 *   weight = 0,
 * )
 */
class HeaderImportPlugin extends PluginBase implements AiImportPluginManagerInterface {

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
    return $this->t('Convert markdown headers to Gutenberg blocks.');
  }

  /**
   * {@inheritDoc}
   */
  public function getSchema() {
    // Actually we are only interest here in keys.
    // Values can be descriptions to help the data extraction if using AI.
    return [
      'attributesJson' => 'json attributes string',
      'headingText' => 'string',
      'headingLevel' => 'number, 2 or 3 or 4.',
      'headerHtmlTag' => 'h2 or h3 or h4. Any other header should be converted to h2.',
    ];
  }

  /**
   * {@inheritDoc}
   */
  public function getTemplate() {
    return <<<EOD
    <!-- wp:custom/heading attributesJson -->
    <headerHtmlTag class="wp-block-custom-heading">headingText</headerHtmlTag>
    <!-- /wp:custom/heading -->
    EOD;
  }

  /**
   * {@inheritDoc}
   */
  public function matches(array $chunk) {
    return $chunk['type'] == 'Header';
  }

  /**
   * {@inheritDoc}
   */
  public function convert(array $chunk) {
    // We are using some custom method here.
    // @todo Add a validation method.
    $data = $this->parseMarkdownHeader($chunk['raw']);
    return $this->generateBlock($data);
  }

  /**
   * Parses a markdown header string and returns details about it.
   *
   * This method trims whitespace from the header string, matches a specific
   * markdown heading pattern, determines the heading level based on the number
   * of '#' characters, and generates the corresponding HTML tag for the header.
   *
   * The resulting heading level is constrained between 2 and 4 based on custom rules.
   *
   * @param string $header
   *   The markdown header string to parse.
   *
   * @return array
   *   An associative array.
   *
   * @throws \InvalidArgumentException if the header is not in a valid markdown format.
   */
  private function parseMarkdownHeader(string $header): array {
    // Trim whitespace.
    $header = trim($header);

    // Match the heading pattern.
    if (!preg_match('/^(#{1,6})\s+(.+)$/', $header, $matches)) {
      throw new \InvalidArgumentException('Invalid markdown header format');
    }

    // Get the number of # symbols to determine heading level.
    $level = strlen($matches[1]);

    // Restrictions from the custom/header SLB block.
    if ($level == 1) {
      $level = 2;
    }

    if ($level > 4) {
      $level = 4;
    }

    // Get the actual heading text.
    $text = trim($matches[2]);
    // $text = str_replace('"', '', $text);
    // $text = str_replace('\\', '', $text);
    // Create the corresponding HTML tag.
    $headerHtmlTag = 'h' . $level;

    $attributesJson = [
      'level' => intval($level),
      'text' => $text,
    ];

    return [
      'attributesJson' => json_encode($attributesJson),
      'headingText' => $text,
      'headingLevel' => $level,
      'headerHtmlTag' => $headerHtmlTag,
    ];
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
