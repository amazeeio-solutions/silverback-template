<?php

namespace Drupal\remote_page\Commands;

use Drush\Commands\DrushCommands;

class CleanupRemotePages extends DrushCommands {

  /**
   * Queue remote pages for cleanup.
   *
   * @command remote_page:cleanup
   * @aliases rpc
   * @option batch-size The number of items to process in each batch. Defaults to 100.
   */
  public function cleanupRemotePages($options = ['batch-size' => 100]) {
    /**
     * @var \Drupal\remote_page\CleanupInterface $remotePageCleanup
     */
    $remotePageCleanup = \Drupal::service('remote_page.cleanup');
    $remotePageCleanup->queueCleanup($options['batch-size']);
  }
}
