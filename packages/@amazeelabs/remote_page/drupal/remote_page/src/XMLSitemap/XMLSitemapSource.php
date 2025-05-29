<?php

namespace Drupal\remote_page\XMLSitemap;

class XMLSitemapSource implements XMLSitemapSourceInterface {

  /**
   * {@inheritDoc}
   */
  public function getXmlSitemapEntries(string $xmlsitemapUrl): array {
    $sitemapUrls = $this->listXmlSitemaps($xmlsitemapUrl);
    $entries = [];
    foreach ($sitemapUrls as $sitemapUrl) {
      $xmlContent = file_get_contents($sitemapUrl);
      $xml = simplexml_load_string($xmlContent);
      foreach ($xml->url as $url) {
        if (count($entries) >= 5) {
          break;
        }
        $entries[] = [
          'url' => (string) $url->loc,
          'lastmod' => (string) $url->lastmod,
        ];
      }
    }
    return $entries;
  }

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
