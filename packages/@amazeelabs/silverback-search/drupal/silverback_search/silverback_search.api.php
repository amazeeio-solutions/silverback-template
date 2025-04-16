<?php

/**
 * Alter the live URL before it is used for fetching content from the frontend.
 * 
 * If the URL should be skipped, set $liveUrl to "skip".
 */
function hook_silverback_search_live_url_alter(string &$liveUrl, \Drupal\Core\Entity\ContentEntityInterface $entity) {
  if (str_contains($liveUrl, '/special-case')) {
    $liveUrl = 'skip';
  }
}
