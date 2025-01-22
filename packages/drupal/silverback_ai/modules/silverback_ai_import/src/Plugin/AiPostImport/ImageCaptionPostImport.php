<?php

namespace Drupal\silverback_ai_import\Plugin\AiPostImport;

use Drupal\Core\Plugin\PluginBase;
use Drupal\silverback_ai_import\AiPostImportPluginManagerInterface;

/**
 * Provides a default gutenberg block converter plugin.
 *
 * @Plugin(
 *   id = "ai_image_captions",
 *   label = @Translation("Handleds media image captions."),
 *   weight = 0,
 * )
 */
class ImageCaptionPostImport extends PluginBase implements AiPostImportPluginManagerInterface {

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
    return $this->t('Handles media image captions');
  }

  /**
   * {@inheritDoc}
   */
  public function convert(array $chunks) {
    // @todo Find a better way to explode/implode chunks
    // @todo Add DI
    // $ai = \Drupal::service('silverback_ai_import.content');
    // $input = implode('\n', $chunks);
    // $out = $ai->request($this->getPrompt($input));
    return $chunks;
  }

  private function getPrompt(string $input) {
    // @todo
    $prompt = <<<EOD
    Process Gutenberg editor blocks to properly place image captions within image-with-text components.

    Input:
    $input

    ## Input Requirements
    - Gutenberg blocks
    - May contain wp:custom/image-with-text blocks
    - May contain standalone paragraph blocks with image captions

    ## Processing Rules
    1. Scan for potential image captions:
       - Located in paragraph blocks
       - Follows immediately after wp:custom/image-with-text blocks
       - Usually in italic format (`<em>` tags)

    2. Caption Integration:
       - Move identified captions inside wp:custom/image-with-text blocks
       - Replace only existing empty paragraph tags (`<p></p>`)
       - Maintain original caption formatting

    3. Structure Preservation:
       - Keep all other content unchanged
       - Maintain valid Gutenberg block syntax
       - Preserve all block attributes and properties

    ## Output Format
    Return complete Gutenberg block structure with integrated captions and nothing else.

    ## Validation
    - Ensure output maintains valid Gutenberg syntax
    - Verify all captions are properly nested
    - Confirm no content loss during transformation
    EOD;

    return $prompt;
  }
}
