<?php

namespace Drupal\search_api_external;

use Drupal\Core\Entity\EntityTypeManagerInterface;

class SapiXMLSitemap implements SapiXMLSitemapInterface {
 
  public function __construct(
    protected EntityTypeManagerInterface $entityTypeManager,
    protected XMLSitemapListInterface $xmlSitemapList
  ) {}

  /**
   * {@inheritDoc}
   */
  public function getSitemapUrls(): array {
    $sitemapUrls = [];
    /**
   * @var \Drupal\search_api\Entity\Index $indexes
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
        // external_web_page.
        if ($datasourceId !== 'entity:external_web_page') {
          continue;
        }
        $datasourceConfiguration = $datasource->getConfiguration();
        $xmlsitemapUrl = $datasourceConfiguration['xmlsitemap_urls'];
        $xmlsitemaps = $this->xmlSitemapList->listXmlSitemaps($xmlsitemapUrl);
        if (empty($xmlsitemaps)) {
          continue;
        }
        $sitemapUrls = array_merge($sitemapUrls, $xmlsitemaps);
      }
    }
    return $sitemapUrls;
  }
}