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
  public function bulkSync(array $remotePages, int $lastSeenIndex) {
    $remoteHashedPages = $this->prepareRemotePages($remotePages);
    $this->processPagesInChunks($remoteHashedPages, $lastSeenIndex);
  }

  /**
   * Prepares remote pages by computing their hashes and handling lastmod dates.
   *
   * @param array $remotePages
   *   Array of remote page data.
   *
   * @return array
   *   Array of remote pages keyed by their hash.
   */
  protected function prepareRemotePages(array $remotePages): array {
    $remoteHashedPages = [];
    foreach ($remotePages as $remotePage) {
      if (empty($remotePage['lastmod']) && !empty($remotePage['changefreq'])) {
        $remotePage['lastmod'] = $this->getLastModeBasedOnChangefreq($remotePage['changefreq']);
      }
      $hash = RemotePage::generateHash($remotePage['url'], $remotePage['lastmod']);
      $remoteHashedPages[$hash] = $remotePage;
    }
    return $remoteHashedPages;
  }

  /**
   * Processes remote pages in chunks to avoid large database queries.
   *
   * @param array $remoteHashedPages
   *   Array of remote pages keyed by their hash.
   * @param int $lastSeenIndex
   *   The last seen index value.
   */
  protected function processPagesInChunks(array $remoteHashedPages, int $lastSeenIndex): void {
    $remotePageStorage = $this->entityTypeManager->getStorage('remote_page');
    $baseTable = $remotePageStorage->getBaseTable();

    foreach (array_chunk($remoteHashedPages, 100, TRUE) as $remoteHashedPagesChunk) {
      $existingHashes = $this->getExistingHashes($baseTable, array_keys($remoteHashedPagesChunk));
      $this->updateLastSeenIndex($baseTable, $existingHashes, $lastSeenIndex);
      $this->processNewPages($remotePageStorage, array_diff_key($remoteHashedPagesChunk, $existingHashes), $lastSeenIndex);
    }
  }

  /**
   * Gets existing hashes from the database.
   *
   * @param string $baseTable
   *   The base table name.
   * @param array $hashes
   *   Array of hashes to check.
   *
   * @return array
   *   Array of existing hashes.
   */
  protected function getExistingHashes(string $baseTable, array $hashes): array {
    return $this->database->select($baseTable, 'base_table')
      ->fields('base_table', ['hash'])
      ->condition('hash', $hashes, 'IN')
      ->execute()
      ->fetchAllKeyed(0, 0);
  }

  /**
   * Updates the last seen index for existing pages.
   *
   * @param string $baseTable
   *   The base table name.
   * @param array $hashes
   *   Array of hashes to update.
   * @param int $lastSeenIndex
   *   The last seen index value.
   */
  protected function updateLastSeenIndex(string $baseTable, array $hashes, int $lastSeenIndex): void {
    if (!empty($hashes)) {
      $this->database->update($baseTable)
        ->fields(['lastseenindex' => $lastSeenIndex])
        ->condition('hash', array_keys($hashes), 'IN')
        ->execute();
    }
  }

  /**
   * Processes new pages that don't exist in the database.
   *
   * @param \Drupal\Core\Entity\EntityStorageInterface $storage
   *   The entity storage.
   * @param array $newPages
   *   Array of new pages to process.
   * @param int $lastSeenIndex
   *   The last seen index value.
   */
  protected function processNewPages($storage, array $newPages, int $lastSeenIndex): void {
    foreach ($newPages as $hash => $remotePage) {
      $item = $this->getOrCreateRemotePage($storage, $remotePage);
      $this->updateRemotePage($item, $remotePage, $lastSeenIndex);
      $item->save();
    }
  }

  /**
   * Gets an existing remote page or creates a new one.
   *
   * @param \Drupal\Core\Entity\EntityStorageInterface $storage
   *   The entity storage.
   * @param array $remotePage
   *   The remote page data.
   *
   * @return \Drupal\remote_page\Entity\RemotePage
   *   The remote page entity.
   */
  protected function getOrCreateRemotePage($storage, array $remotePage): RemotePage {
    $item = $storage->loadByProperties(['url' => $remotePage['url']]);
    if ($item) {
      return reset($item);
    }

    $host = parse_url($remotePage['url'], PHP_URL_HOST);
    $host = str_replace('.', '_', $host);
    return $storage->create([
      'url' => $remotePage['url'],
      'host' => $host,
    ]);
  }

  /**
   * Updates a remote page entity with new data.
   *
   * @param \Drupal\remote_page\Entity\RemotePage $item
   *   The remote page entity.
   * @param array $remotePage
   *   The remote page data.
   * @param int $lastSeenIndex
   *   The last seen index value.
   */
  protected function updateRemotePage(RemotePage $item, array $remotePage, int $lastSeenIndex): void {
    $item->set('lastmod', $remotePage['lastmod']);
    if (!empty($remotePage['changefreq'])) {
      $item->set('changefreq', $remotePage['changefreq']);
    }
    $item->set('lastseenindex', $lastSeenIndex);
  }

  /**
   * Generate a lastmod date based on the changefreq value.
   *
   * @param string $changefreq
   *   The change frequency value.
   *
   * @return string
   *   The formatted lastmod date.
   */
  protected function getLastModeBasedOnChangefreq(string $changefreq): string {
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
