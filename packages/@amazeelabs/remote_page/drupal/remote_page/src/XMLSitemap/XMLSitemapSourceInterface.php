<?php

namespace Drupal\remote_page\XMLSitemap;

interface XMLSitemapSourceInterface {

  /**
   * Given a url to an xml sitemap, it returns a list with all the entries in
   * the sitemap. Each element of the array will contain the url and the lastmod
   * date of the page.
   *
   * @param string $xmlsitemapUrl
   *   The url to the xml sitemap.
   * @return array
   *   An array with the url and the lastmod date of the page.
   */
  public function getXmlSitemapEntries(string $xmlsitemapUrl): array;

  /**
   * Given a url to a root xml sitemap, it returns a list with all the actual
   * xml sitemaps. If the url points to a sitemap index, it will return a list
   * with all the sitemaps included in the index. If the url points to a single
   * sitemap, it will return a list with that sitemap url.
   * 
   * @param string $xmlsitemapUrl
   *   The url to the root xml sitemap.
   * @return array
   */
  public function listXmlSitemaps(string $xmlsitemapUrl): array;
}
