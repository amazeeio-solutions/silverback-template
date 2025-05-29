<?php

namespace Drupal\remote_page;

interface CleanupInterface {

  /**
   * Adds the remote pages that need to be checked for cleanup to the queue.
   */
  public function queueCleanup();

  /**
   * Cleans up a list of remote pages.
   * @param array $remotePages
   * @return void
   */
  public function cleanup(array $remotePages);
}
