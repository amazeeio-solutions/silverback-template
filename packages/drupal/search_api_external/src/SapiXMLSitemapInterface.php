<?php

namespace Drupal\search_api_external;

interface SapiXMLSitemapInterface {
  
  /**
   * Returns a list with all the sitemap urls that can be found in the enabled
   * search api indexes that have a datasource of type 'external_web_page'.
   *
   * @return array
   */
  public function getSitemapUrls(): array;
}
