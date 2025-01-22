<?php

namespace Drupal\silverback_ai_import;

/**
 * An interface for all Sandwich type plugins.
 */
interface AiPostImportPluginManagerInterface {

  /**
   * If the current plugin matches the given chunk.
   *
   * @return array
   *   An array of chunks.
   */
  public function convert(array $chunks);

}
