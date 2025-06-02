<?php

namespace Drupal\remote_page;

interface RemotePageSyncInterface {
  public function bulkSync($remotePages, $lastSeenIndex);

}
