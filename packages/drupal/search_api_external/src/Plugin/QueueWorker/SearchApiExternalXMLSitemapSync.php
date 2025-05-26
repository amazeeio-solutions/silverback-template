<?php

namespace Drupal\search_api_external\Plugin\QueueWorker;

use Drupal\Core\Queue\QueueWorkerBase;
use Drupal\search_api_external\Entity\ExternalWebPage;

/**
 * Syncs external web pages from an XML sitemap to external_web_page entities.
 *
 * @QueueWorker(
 *   id = "search_api_external_xmlsitemap_sync",
 *   title = @Translation("Search API External XML Sitemap Sync"),
 *   cron = {"time" = 60}
 * )
 */
class SearchApiExternalXMLSitemapSync extends QueueWorkerBase {

  /**
   * {@inheritDoc}
   */
  public function processItem($data) {
    ExternalWebPage::syncFromXmlSitemap($data['url']);
  }
}
