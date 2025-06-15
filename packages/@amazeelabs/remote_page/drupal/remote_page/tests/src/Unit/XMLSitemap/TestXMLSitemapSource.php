<?php

namespace Drupal\Tests\remote_page\Unit\XMLSitemap;
use Drupal\remote_page\XMLSitemap\XMLSitemapSource;

class TestXMLSitemapSource extends XMLSitemapSource {

  protected function getContentFromUrl(string $url): string|bool {
    $content = parent::getContentFromUrl($url);
    if ($content === FALSE) {
      return FALSE;
    }
    $content = str_replace('__DIR__', __DIR__, $content);
    return $content;
  }
}
