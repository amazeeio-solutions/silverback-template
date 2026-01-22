<?php

namespace Drupal\silverback_gatsby_example;

use Drupal\graphql_directives\Api;
use Drupal\node\NodeInterface;

/**
 * Directive implementations for the example module.
 */
class Directives {

  /**
   * Resolve the layout/template value for a node.
   */
  public static function layout(Api $api): ?string {
    $node = $api->parent;
    if (!$node instanceof NodeInterface) {
      return NULL;
    }
    return $node->get('promote')->value ? 'blog-promoted' : NULL;
  }

}
