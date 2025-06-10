<?php

namespace Drupal\search_api_remote_page\Commands;

use Drush\Commands\DrushCommands;

class XMLSitemapTracker extends DrushCommands {

  /**
   * Tracks all the XML sitemaps defined by search api indexes.
   *
   * @command search_api_remote_page:track-xmlsitemaps
   * @aliases sapi-txml
   */
  public function trackXmlSitemaps() {
    $sapiRemotePageSync = \Drupal::service('search_api_remote_page.sapi_remote_page_sync');
    $sapiRemotePageSync->checkForUpdates();
  }
}
