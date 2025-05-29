<?php

namespace Drupal\search_api_remote_page;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Queue\QueueFactory;
use Drupal\Core\Queue\QueueFactoryInterface;
use Drupal\remote_page\XMLSitemap\XMLSitemapSourceInterface;

class SapiRemotePageSync implements SapiRemotePageSyncInterface {

  public function __construct(
    protected EntityTypeManagerInterface $entityTypeManager,
    protected XMLSitemapSourceInterface $xmlSitemapSource,
    protected QueueFactory $queueFactory,
  ) {}

  /**
   * {@inheritDoc}
   */
  public function checkForUpdates() {
    $sitemapUrls = $this->getSitemapUrls();
    foreach ($sitemapUrls as $sitemapUrl) {
      $job = [
        'url' => $sitemapUrl,
      ];
      $this->queueFactory->get('remote_page_xmlsitemap_sync')->createItem($job);
    }
  }

  /**
   * {@inheritDoc}
   */
  public function getSitemapUrls() {
    $sitemapUrls = [];
    /**
   * @var \Drupal\search_api\Entity\Index[] $indexes
   */
    $indexes = $this->entityTypeManager->getStorage('search_api_index')->loadMultiple();
    foreach ($indexes as $index) {
      // Ignore indexes that are not enabled.
      if (!$index->status()) {
        continue;
      }
      $datasources = $index->getDatasources();
      foreach ($datasources as $datasource) {
        $datasourceId = $datasource->getPluginId();
        // Ignore datasources that are not set to track entities of type
        // remote_page.
        if ($datasourceId !== 'entity:remote_page') {
          continue;
        }
        $datasourceConfiguration = $datasource->getConfiguration();
        // @todo: support for multiple xmlsitemap urls.
        $xmlsitemapUrl = $datasourceConfiguration['xmlsitemap_urls'];
        $xmlsitemaps = $this->xmlSitemapSource->listXmlSitemaps($xmlsitemapUrl);
        if (empty($xmlsitemaps)) {
          continue;
        }
        $sitemapUrls = array_merge($sitemapUrls, $xmlsitemaps);
      }
    }
    return $sitemapUrls;
  }
}
