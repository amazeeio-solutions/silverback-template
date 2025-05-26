<?php

namespace Drupal\search_api_external;

interface SapiExternalSyncInterface {

  /**
   * Checks for updates in the external web pages.
   */
  public function checkForUpdates();
}
