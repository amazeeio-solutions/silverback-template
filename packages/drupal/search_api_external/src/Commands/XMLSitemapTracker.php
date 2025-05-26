<?php

namespace Drupal\search_api_external\Commands;

use Drush\Commands\DrushCommands;

class XMLSitemapTracker extends DrushCommands {

  /**
   * Tracks all the XML sitemaps defined by search api indexes.
   *
   * @command search_api_external:track-xmlsitemaps
   * @aliases sapi-txml
   */
  public function trackXmlSitemaps() {
    $sapiExternalSync = \Drupal::service('search_api_external.sapi_external_sync');
    $sapiExternalSync->checkForUpdates();
  }
}
