<?php

namespace Drupal\search_api_external;

class XMLSitemapList implements XMLSitemapListInterface {

  /**
   * {@inheritDoc}
   */
  public function listXmlSitemaps(string $xmlsitemapUrl): array {
    $sitemapUrls = [];
    $xmlSitemap = file_get_contents($xmlsitemapUrl);
    $xmlSitemap = simplexml_load_string($xmlSitemap);
    // If the sitemap is a sitemap index, we need to get the URL of each
    // individual sitemap and add it to the list of sitemap URLs.
    if (!empty($xmlSitemap->sitemap)) {
      foreach ($xmlSitemap->sitemap as $sitemap) {
        $sitemapUrls[] = (string) $sitemap->loc;
      }
    } else {
      // This case is when the url points directly to the sitemap.
      $sitemapUrls[] = (string) $xmlsitemapUrl;
    }
    return $sitemapUrls;
  }
}
