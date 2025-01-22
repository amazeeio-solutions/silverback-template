<?php

declare(strict_types=1);

namespace Drupal\silverback_ai_import;

use Drupal\Component\Serialization\Json;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Database\Connection;
use Drupal\Core\Datetime\DrupalDateTime;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Link;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\Core\Render\Markup;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\file\FileInterface;
use Drupal\user\Entity\User;

/**
 * @todo Add class description.
 */
final class ContentImportLoggerService {

  private const USER_ADMIN = 1;
  private const PAGER_LIMIT = 25;

  use StringTranslationTrait;

  /**
   * Constructs a TokenUsage object.
   */
  public function __construct(
    private readonly Connection $connection,
    private readonly AccountProxyInterface $currentUser,
    private readonly LoggerChannelFactoryInterface $loggerFactory,
    private readonly ConfigFactoryInterface $configFactory,
    private readonly EntityTypeManagerInterface $entityTypeManager,
  ) {
  }

  /**
   * @param $ast
   * @param \Drupal\Core\Entity\EntityInterface $entity
   * @param string $source
   *
   * @return void
   */
  public function createEntry($ast, EntityInterface $entity, string $source): void {

    $uid = self::USER_ADMIN;
    if ($this->currentUser) {
      $uid = $this->currentUser->id();
    }

    // @todo Validate input array
    try {
      $this->connection
        ->insert('silverback_ai_import')
        ->fields([
          'uid' => $uid,
          'timestamp' => (new DrupalDateTime())->getTimestamp(),
          'target_entity_type_id' => $entity->getEntityTypeId(),
          'target_entity_id' => $entity->id(),
          'target_entity_revision_id' => NULL,
          'source' => $source ?? '',
          'output_folder' => $ast->outputDirectory,
          'data' => serialize($ast),
        ])
        ->execute();
    } catch (\Exception $e) {
      $this->loggerFactory->get('silverback_ai')->error($e->getMessage());
    }
  }

  /**
   * Retrieves a list of entries from the 'silverback_ai_import' table.
   *
   * This function queries the database to select fields related to AI usage
   * and orders them by ID in descending order. It paginates the result
   * according to a predefined limit. Each row fetched from the database
   * is processed using the `buildRow` method before being added to the result set.
   *
   * @return array
   *   An array of processed database records.
   */
  public function getEntries() {
    $query = $this->connection->select('silverback_ai_import', 's')
      ->fields('s', [
        'id',
        'uid',
        'timestamp',
        'target_entity_id',
        'target_entity_type_id',
        'target_entity_revision_id',
        'source',
        'output_folder',
        'data',
      ])
      ->orderBy('id', 'DESC');
    $pager = $query->extend('Drupal\Core\Database\Query\PagerSelectExtender')->limit(self::PAGER_LIMIT);
    $rsc = $pager->execute();
    $rows = [];

    foreach ($rsc->fetchAll() as $row) {
      $rows[] = $this->buildRow($row);
    }

    return $rows;
  }

  /**
   * Builds a renderable array representing a row of data.
   *
   * This method constructs an array of information based on the data from
   * the provided row, including entity details, user information, and additional
   * metadata such as timestamps and provider information.
   *
   * @param object $row
   *   The data row object containing properties such as 'target_entity_id',
   *   'target_entity_type_id', 'uid', 'timestamp', 'total_count', 'provider',
   *   'model', and 'module'.
   *
   * @return array
   *   Array with the following elements:
   *   - 'timestamp': The formatted timestamp of when the entry was created.
   *   - 'username': The display name of the user associated with the entry.
   *   - 'entity_id': The capitalized entity bundle string or empty string if
   *     the entity is not found.
   *   - 'info': A renderable link to detailed usage information displayed in
   *     a modal dialog.
   *
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   */
  public function buildRow($row) {
    $entity_info = '';
    if ($row->target_entity_id && $row->target_entity_type_id) {
      // @todo Aldo check revision
      $entity = $this->entityTypeManager->getStorage($row->target_entity_type_id)->load($row->target_entity_id);
      $entity_info = $entity ? $entity->bundle() : '';
      // @todo Add url to entity. Problem is the e.g. File entities
      // they return exception calling this method.
    }

    $user = User::load($row->uid);
    $username = '';
    if ($user) {
      $username = $user->getDisplayName();
    }

    $icon_info = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-info-circle" viewBox="0 0 16 16">
      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
      <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
      </svg>';

    $link = Link::createFromRoute(
      Markup::create($icon_info),
      'silverback_ai.ai_usage.details',
      ['record' => $row->id],
      [
        'attributes' => [
          'class' => ['use-ajax'],
          'data-dialog-type' => 'modal',
          'data-dialog-options' => Json::encode([
            'width' => 800,
          ]),
        ],
        'attached' => [
          'library' => ['core/drupal.dialog.ajax'],
        ],
      ]
    );

    return [
      'timestamp' => DrupalDateTime::createFromTimestamp($row->timestamp)->format('d.m.Y H:i'),
      'username' => $username,
      'entity_id' => ucfirst($entity_info),
      'info' => $link,
    ];
  }
}
