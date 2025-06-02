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
  public function queueCleanup() {
    $remotePageStorage = $this->entityTypeManager->getStorage('remote_page');
    $baseTable = $remotePageStorage->getBaseTable();

    // When we decide which remote pages to delete, we will first get the
    // maximum value of lastseenindex. Then we will get all remote pages which
    // have a lastseenindex lower that that value.
    // @todo: this is not a very safe approach, it might be that we need to
    // revisit this logic this if it creates issues.
    $query = $this->database->select($baseTable, 'base_table');
    $query->addExpression('MAX(lastseenindex)', 'max_lastseenindex');
    $maxLastSeenIndex = (int) $query->execute()->fetchField(0);
    if (empty($maxLastSeenIndex)) {
      return;
    }

    $lastId = 0;
    $batchSize = 100;
    $baseQuery = $this->database->select($baseTable, 'base_table')
      ->fields('base_table', ['rpid'])
      ->condition('lastseenindex', $maxLastSeenIndex - 1, '<')
      ->orderBy('rpid', 'ASC');
    $baseQuery->range(0, $batchSize);

    $query = clone $baseQuery;
    $query->condition('rpid', $lastId, '>');
    $result = $query->execute();
    $remotePageIds = $result->fetchAllKeyed(0, 0);
    while (!empty($remotePageIds)) {
      $lastId = end($remotePageIds);
      $this->queueFactory->get('remote_page_cleanup')->createItem($remotePageIds);
      $query = clone $baseQuery;
      $query->condition('rpid', $lastId, '>');
      $remotePageIds = $query->execute()->fetchAllKeyed(0, 0);
    }
  }

  /**
   * {@inheritDoc}
   */
  public function cleanup(array $remotePageIds) {
    $remotePages = $this->entityTypeManager->getStorage('remote_page')->loadMultiple($remotePageIds);
    $this->entityTypeManager->getStorage('remote_page')->delete($remotePages);
  }
}
