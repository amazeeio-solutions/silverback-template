<?php

namespace Drupal\silverback_ai_import;

/**
 * An interface for all Sandwich type plugins.
 */
interface AiImportPluginManagerInterface {

  /**
   * Provide a description of the plugin.
   *
   * @return string
   *   A string description of the sandwich.
   */
  public function description();

  /**
   * Defines the schema (attributes) of the block.
   */
  public function getSchema();

  /**
   * Defines the template (gutenberg) of the block.
   */
  public function getTemplate();

  /**
   * If the current plugin matches the given chunk.
   *
   * @return bool
   *   true if matches, false otherwise.
   */
  public function matches(array $chunk);

  /**
   * If the current plugin matches the given chunk.
   *
   * @return string
   *   A string representation of the gutenberg block.
   */
  public function convert(array $chunk);

  /**
   * Generates a block string by replacing template placeholders.
   *
   * This function takes a chunk of markdown content and a template string.
   * It uses the parsed data from the markdown header to replace placeholders
   * in the template with actual values corresponding to the markdown header's
   * level, text, and HTML tag. Before processing, it ensures that all required
   * keys are available in the parsed data.
   *
   * @param array $data
   *   The template string containing placeholders for replacement.
   *
   * @return string The template string with placeholders replaced by actual data.
   *
   * @throws \InvalidArgumentException if a required key is missing from the parsed data.
   */
  public function generateBlock(array $data);

}
