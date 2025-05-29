<?php

namespace Drupal\remote_page\Plugin\QueueWorker;

use Drupal\Core\Queue\QueueWorkerBase;
use Drupal\remote_page\Entity\RemotePage;

/**
 * Syncs remote pages from an XML sitemap to remote_page entities.
 *
 * @QueueWorker(
 *   id = "remote_page_xmlsitemap_sync",
 *   title = @Translation("Remote Page XML Sitemap Sync"),
 *   cron = {"time" = 60}
 * )
 */
class RemotePageXMLSitemapSync extends QueueWorkerBase {

  /**
   * {@inheritDoc}
   */
  public function processItem($data) {
    /**
     * @var \Drupal\remote_page\XMLSitemap\XMLSitemapSourceInterface $xmlSitemapSource
     */
    $xmlSitemapSource = \Drupal::service('remote_page.xmlsitemap_source');
    RemotePage::bulkSync($xmlSitemapSource->getXmlSitemapEntries($data['url']));
  }
}
