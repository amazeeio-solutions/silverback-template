<?php

namespace Drupal\custom;

use Drupal\graphql_directives\DirectiveArguments;

/**
 * Helper service for managing content moderation with graphql.
 */
class ContentModeration {

  /**
   * Directive to moderate content
   */
  public function moderateContent(DirectiveArguments $args) : array {
    \Drupal::logger('debug')->info('Content moderated!: ' . $args->args['contentId'] . ' (' . $args->args['contentType'] . ')');
    return [];
  }
}
