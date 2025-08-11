<?php

namespace Drupal\custom;

use Drupal\graphql_directives\Api;

/**
 * Custom Gutenberg-related GraphQL service.
 */
class Gutenberg {

  /**
   * Resolves an editor block attribute that contains a JSON array.
   * 
   * Parses the JSON string and converts it to the appropriate array type.
   */
  public function resolveEditorBlockJsonArrayAttribute(Api $api): array {
    $key = $api->args['key'];
    $block = $api->parent;
    
    // Access the block attributes (using 'attrs' key based on debug output)
    if (!is_array($block) || !isset($block['attrs'])) {
      return [];
    }
    
    $attributes = $block['attrs'];
    
    if (!isset($attributes[$key])) {
      return [];
    }
    
    $value = $attributes[$key];
    
    // If it's already an array, return it directly (converted to floats)
    if (is_array($value)) {
      return array_map(function($item) {
        return is_numeric($item) ? (float) $item : $item;
      }, $value);
    }
    
    // If it's a string, try to decode as JSON
    if (is_string($value) && !empty($value)) {
      $decoded = json_decode($value, true);
      
      if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
        return array_map(function($item) {
          return is_numeric($item) ? (float) $item : $item;
        }, $decoded);
      }
    }
    
    // Fallback: return empty array
    return [];
  }

}