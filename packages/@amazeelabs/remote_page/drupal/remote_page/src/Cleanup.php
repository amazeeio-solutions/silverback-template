<?php

namespace Drupal\remote_page;

use Drupal\Core\Database\Connection;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Queue\QueueFactory;

class Cleanup implements CleanupInterface {

  public function __construct(
    protected EntityTypeManagerInterface $entityTypeManager,
    protected Connection $database,
    protected QueueFactory $queueFactory
  ) {}

  /**
   * {@inheritDoc}
   */
  public function queueCleanup(int $batchSize = 100) {
    $remotePageStorage = $this->entityTypeManager->getStorage('remote_page');
    $baseTable = $remotePageStorage->getBaseTable();

    // When we decide which remote pages to delete, we will first get the
    // maximum value of lastseenindex. Then we will get all remote pages which
    // have a lastseenindex lower that that value.
    // @todo: this is not a very safe approach, it might be that we need to
    // revisit this logic this if it creates issues.
    $maxLastSeenIndex = $this->getMaxLastSeenIndex();
    if (empty($maxLastSeenIndex)) {
      return;
    }

    $lastId = 0;
    $remotePageIds = $this->getNextIdsForCleanup($lastId, $maxLastSeenIndex - 2, $batchSize);
    while (!empty($remotePageIds)) {
      $lastId = end($remotePageIds);
      $this->queueFactory->get('remote_page_cleanup')->createItem($remotePageIds);
      $remotePageIds = $this->getNextIdsForCleanup($lastId, $maxLastSeenIndex - 2, $batchSize);
    }
  }

  /**
   * {@inheritDoc}
   */
  public function cleanup(array $remotePageIds) {
    $remotePages = $this->entityTypeManager->getStorage('remote_page')->loadMultiple($remotePageIds);
    $this->entityTypeManager->getStorage('remote_page')->delete($remotePages);
  }

  /**
   * Get the next batch of remote page IDs for cleanup.
   *
   * @param int $excludeLessThanId
   *   Will exclude all remote pages with an ID less than this value.
   * @param int $maxLastSeenIndex
   *   The maximum last seen index value.
   * @param int $batchSize
   *   The number of remote page IDs to return.
   *
   * @return array
   *   An array of remote page IDs.
   */
  protected function getNextIdsForCleanup(int $excludeLessThanId, int $maxLastSeenIndex, $batchSize = 100) {
    $baseTable = $this->getRemotePagesBaseTable();

    $query = $this->database->select($baseTable, 'base_table')
      ->fields('base_table', ['rpid'])
      ->condition('lastseenindex', $maxLastSeenIndex, '<=')
      ->orderBy('rpid', 'ASC')
      ->condition('rpid', $excludeLessThanId, '>')
      ->range(0, $batchSize);

    return $query->execute()->fetchAllKeyed(0, 0);
  }

  /**
   * Get the maximum last seen index value.
   *
   * @return int
   *   The maximum last seen index value.
   */
  protected function getMaxLastSeenIndex() {
    $baseTable = $this->getRemotePagesBaseTable();
    $query = $this->database->select($baseTable, 'base_table');
    $query->addExpression('MAX(lastseenindex)', 'max_lastseenindex');

    return (int) $query->execute()->fetchField(0);
  }

  /**
   * Get the base table name.
   *
   * @return string
   *   The base table name.
   */
  protected function getRemotePagesBaseTable() {
    $remotePageStorage = $this->entityTypeManager->getStorage('remote_page');
    return $remotePageStorage->getBaseTable();
  }
}
