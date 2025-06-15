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
    $lastSeenIndex = \Drupal::state()->get('search_api_remote_page_last_seen_index', 0);
    $lastSeenIndex = $lastSeenIndex + 1;
    foreach ($sitemapUrls as $sitemapUrl) {
      $job = [
        'url' => $sitemapUrl,
        'last_seen_index' => $lastSeenIndex,
      ];
      $this->queueFactory->get('remote_page_xmlsitemap_sync')->createItem($job);
    }
    \Drupal::state()->set('search_api_remote_page_last_seen_index', $lastSeenIndex);
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
        $xmlsitemapUrls = explode("\n", $datasourceConfiguration['xmlsitemap_urls']);
        if (empty($xmlsitemapUrls)) {
          continue;
        }
        foreach ($xmlsitemapUrls as $xmlsitemapUrl) {
          $xmlsitemapUrl = trim($xmlsitemapUrl);
          if (empty($xmlsitemapUrl)) {
            continue;
          }
          $xmlsitemaps = $this->xmlSitemapSource->listXmlSitemaps($xmlsitemapUrl);
          if (empty($xmlsitemaps)) {
            continue;
          }
          $sitemapUrls = array_merge($sitemapUrls, $xmlsitemaps);
        }
      }
    }
    return array_unique($sitemapUrls);
  }
}
