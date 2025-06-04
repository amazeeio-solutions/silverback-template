<?php

namespace Drupal\remote_page\XMLSitemap;

use Drupal\Core\Utility\Error;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
class XMLSitemapSource implements XMLSitemapSourceInterface {

  /**
   * Constructs a new XMLSitemapSource object.
   *
   * @param \Drupal\Core\Logger\LoggerChannelFactoryInterface $loggerFactory
   *   The logger factory.
   */
  public function __construct(
    protected LoggerChannelFactoryInterface $loggerFactory,
  ) {}

  /**
   * {@inheritDoc}
   */
  public function getXmlSitemapEntries(string $xmlsitemapUrl): array {
    $sitemapUrls = $this->listXmlSitemaps($xmlsitemapUrl);
    $entries = [];
    foreach ($sitemapUrls as $sitemapUrl) {
      $xml = $this->getXmlContent($sitemapUrl);
      foreach ($xml->url as $url) {
        $entries[] = [
          'url' => (string) $url->loc,
          'lastmod' => isset($url->lastmod) ? (string) $url->lastmod : NULL,
          'changefreq' => isset($url->changefreq) ? (string) $url->changefreq : NULL,
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
    $xmlSitemap = $this->getXmlContent($xmlsitemapUrl);
    if ($xmlSitemap === FALSE) {
      return [];
    }
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

  /**
   * Gets the XML content from an URL.
   *
   * @param string $xmlUrl
   *   The URL.
   *
   * @return bool|\SimpleXMLElement
   *   The XML content of the sitemap or FALSE if the content is not valid.
   */
  protected function getXmlContent(string $xmlUrl): bool | \SimpleXMLElement {
    try {
      $xmlContent = $this->getContentFromUrl($xmlUrl);
      if ($xmlContent === FALSE) {
        $this->loggerFactory->get('remote_page')->error('Failed to fetch sitemap content from %url', ['%url' => $xmlUrl]);
        return FALSE;
      }
      $xmlString = $this->loadXmlFromString($xmlContent);
      if ($xmlString === FALSE) {
        $this->loggerFactory->get('remote_page')->error('Failed to parse XML from %url', ['%url' => $xmlUrl]);
        return FALSE;
      }
      return $xmlString;
    } catch (\Exception $e) {
      Error::logException($this->loggerFactory->get('remote_page'), $e);
      return FALSE;
    }
  }

  /**
   * Gets the content (as a string) from an URL.
   *
   * @param string $url
   *   The URL.
   *
   * @return bool|string
   */
  protected function getContentFromUrl(string $url): string|bool {
    return file_get_contents($url);
  }

  /**
   * Loads an XML string into a SimpleXMLElement.
   *
   * @param string $xmlString
   *   The XML string.
   *
   * @return \SimpleXMLElement|bool
   */
  protected function loadXmlFromString(string $xmlString): \SimpleXMLElement|bool {
    return simplexml_load_string($xmlString);
  }
}
