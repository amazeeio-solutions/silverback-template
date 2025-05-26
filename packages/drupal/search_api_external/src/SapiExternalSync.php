<?php

namespace Drupal\search_api_external;

use Drupal\Core\Queue\QueueFactory;

class SapiExternalSync implements SapiExternalSyncInterface {

  public function __construct(
    protected SapiXMLSitemapInterface $xmlSitemap,
    protected QueueFactory $queueFactory
  ) {}

  /**
   * {@inheritDoc}
   */
  public function checkForUpdates() {
    $sitemapUrls = $this->xmlSitemap->getSitemapUrls();
    foreach ($sitemapUrls as $sitemapUrl) {
      $job = [
        'url' => $sitemapUrl,
      ];
      $this->queueFactory->get('search_api_external_xmlsitemap_sync')->createItem($job);
    }
  }
}
