<?php

namespace Drupal\remote_page\Commands;

use Drush\Commands\DrushCommands;

class CleanupRemotePages extends DrushCommands {

  /**
   * Queue remote pages for cleanup.
   *
   * @command remote_page:cleanup
   * @aliases rpc
   */
  public function cleanupRemotePages() {
    /**
     * @var \Drupal\remote_page\CleanupInterface $remotePageCleanup
     */
    $remotePageCleanup = \Drupal::service('remote_page.cleanup');
    $remotePageCleanup->queueCleanup();
  }
}
