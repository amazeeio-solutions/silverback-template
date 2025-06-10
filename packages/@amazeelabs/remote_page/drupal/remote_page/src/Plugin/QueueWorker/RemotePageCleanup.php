<?php

namespace Drupal\remote_page\Plugin\QueueWorker;

use Drupal\Core\Queue\QueueWorkerBase;

/**
 * Cleans up remote pages by checking if they still exist in the sitemap which
 * was used to create them.
 *
 * @QueueWorker(
 *   id = "remote_page_cleanup",
 *   title = @Translation("Remote Page Cleanup"),
 *   cron = {"time" = 60}
 * )
 */class RemotePageCleanup extends QueueWorkerBase {
  public function processItem($data) {
    \Drupal::service('remote_page.cleanup')->cleanup($data);
  }
}
