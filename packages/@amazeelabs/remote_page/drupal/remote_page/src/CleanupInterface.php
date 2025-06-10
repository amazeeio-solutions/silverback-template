<?php

namespace Drupal\remote_page;

interface CleanupInterface {

  /**
   * Adds the remote pages that need to be checked for cleanup to the queue.
   *
   * @param int $batchSize
   *   The number of items to process in each batch. Defaults to 100.
   */
  public function queueCleanup(int $batchSize = 100);

  /**
   * Cleans up a list of remote pages.
   * @param array $remotePages
   * @return void
   */
  public function cleanup(array $remotePages);
}
