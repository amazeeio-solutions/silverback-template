<?php

namespace Drupal\search_api_remote_page;

interface SapiRemotePageSyncInterface {

  /**
   * Checks for remote pages that have updates. They should be stored in a queue
   * so that they can be processed later in the background.
   */
  public function checkForUpdates();

  /**
   * Returns a list with all the sitemap URLs that are configured across the
   * enabled search indexes.
   */
  public function getSitemapUrls();

}
