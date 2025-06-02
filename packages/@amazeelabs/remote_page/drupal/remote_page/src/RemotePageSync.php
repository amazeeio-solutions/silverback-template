<?php

namespace Drupal\remote_page;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Database\Connection;
use Drupal\remote_page\Entity\RemotePage;
use Drupal\Core\Datetime\DateFormatterInterface;
use Drupal\Component\Datetime\TimeInterface;

class RemotePageSync implements RemotePageSyncInterface {
  public function __construct(
    protected EntityTypeManagerInterface $entityTypeManager,
    protected Connection $database,
    protected DateFormatterInterface $dateFormatter,
    protected TimeInterface $time
  ) {
  }

  /**
   * {@inheritdoc}
   */
  public function bulkSync($remotePages, $lastSeenIndex) {
    $remoteHashedPages = [];
    foreach ($remotePages as $remotePage) {
      // If we do not have a lastmode value, we compute one based on the
      // changefreq value.
      if (empty($remotePage['lastmod']) && !empty($remotePage['changefreq'])) {
        $remotePage['lastmod'] = $this->getLastModeBasedOnChangefreq($remotePage['changefreq']);
      }
      $hash = RemotePage::generateHash($remotePage['url'], $remotePage['lastmod']);
      $remoteHashedPages[$hash] = $remotePage;
    }
    // When deciding which of the remote web pages have been updated, we do the
    // following: we query the database for the hashes that we computed above.
    // All the hashes which match the ones in the database will be fully skipped
    // from processing. For the ones that to do match, we load the entity from
    // the database, based on the url (if it exists) and we will just update the
    // lastmod date.
    // We do all this in chunks of 100, to avoid possible issues with too big
    // sql queries.
    $remotePageEntityTypeManager = $this->entityTypeManager->getStorage('remote_page');
    $baseTable = $remotePageEntityTypeManager->getBaseTable();
    foreach (array_chunk($remoteHashedPages, 100, TRUE) as $remoteHashedPagesChunck) {
      $existingHashes = $this->database->select($baseTable, 'base_table')
        ->fields('base_table', ['hash'])
        ->condition('hash', array_keys($remoteHashedPagesChunck), 'IN')
        ->execute()
        ->fetchAllKeyed(0, 0);
      if (!empty($existingHashes)) {
        // For all existing hashes we want to immediately update the last seen
        // index value, with a direct query.
        $this->database->update($baseTable)
        ->fields(['lastseenindex' => $lastSeenIndex])
        ->condition('hash', array_keys($existingHashes), 'IN')
        ->execute();
      }

      $remoteHashedPagesChunck = array_diff_key($remoteHashedPagesChunck, $existingHashes);
      foreach ($remoteHashedPagesChunck as $hash => $remoteHashedPage) {
        // Load the entity based on the url. If it does not exist yet, we create
        // a new one.
        $item = $remotePageEntityTypeManager->loadByProperties(['url' => $remoteHashedPage['url']]);
        if ($item) {
          $item = reset($item);
        } else {
          $host = parse_url($remoteHashedPage['url'], PHP_URL_HOST);
          $host = str_replace('.', '_', $host);
          $item = $remotePageEntityTypeManager->create([
            'url' => $remoteHashedPage['url'],
            'host' => $host,
          ]);
        }
        $item->set('lastmod', $remoteHashedPage['lastmod']);
        if (!empty($remoteHashedPage['changefreq'])) {
          $item->set('changefreq', $remoteHashedPage['changefreq']);
        }
        $item->set('lastseenindex', $lastSeenIndex);
        $item->save();
      }
    }
  }

  /**
   * Generate a lastmod date based on the changefreq value.
   *
   * @param string $url
   * @param string $changefreq
   * @return string
   */
  public function getLastModeBasedOnChangefreq(string $changefreq) {
    $currentTimestamp = $this->time->getRequestTime();
    switch ($changefreq) {
      case 'hourly':
        return $this->dateFormatter->format($currentTimestamp, 'custom', 'Y-m-d H:00:00');
      case 'daily':
        return $this->dateFormatter->format($currentTimestamp, 'custom', 'Y-m-d 00:00:00');
      case 'weekly':
        return $this->dateFormatter->format($currentTimestamp, 'custom', 'Y-W');
      case 'monthly':
        return $this->dateFormatter->format($currentTimestamp, 'custom', 'Y-m');
      case 'yearly':
        return $this->dateFormatter->format($currentTimestamp, 'custom', 'Y-01-01 00:00:00');
      case 'never':
        return '';
      case 'always':
      default:
        return $this->dateFormatter->format($currentTimestamp, 'custom', 'Y-m-d H:i:s');
    }
  }
}
