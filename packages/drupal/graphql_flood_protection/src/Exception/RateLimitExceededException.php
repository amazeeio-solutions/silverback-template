<?php

namespace Drupal\graphql_flood_protection\Exception;

use GraphQL\Error\Error;
use GraphQL\Error\ClientAware;

/**
 * Custom exception for rate limiting that implements ClientAware.
 */
class RateLimitExceededException extends Error implements ClientAware {
  
  /**
   * {@inheritdoc}
   */
  public function isClientSafe(): bool {
    return TRUE;
  }

  /**
   * {@inheritdoc}
   */
  public function getCategory(): string {
    return 'rate_limit';
  }
} 