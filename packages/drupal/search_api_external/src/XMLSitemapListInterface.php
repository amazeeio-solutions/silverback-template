<?php

namespace Drupal\search_api_external;

interface XMLSitemapListInterface {
  
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
