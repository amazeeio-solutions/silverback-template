<?php

namespace Drupal\remote_page;

interface RemotePageSyncInterface {
  /**
   * Syncs multiple remote pages.
   *
   * @param array $remotePages
   *   Array of remote page data, each containing:
   *   - url: The URL of the remote page
   *   - lastmod: The last modified date (optional)
   *   - changefreq: The change frequency (optional)
   * @param int $lastSeenIndex
   *   The last seen index value.
   */
  public function bulkSync(array $remotePages, int $lastSeenIndex);
}
