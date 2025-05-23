<?php

declare(strict_types=1);

namespace Drupal\chat_ai;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Config\ImmutableConfig;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\ai\AiProviderPluginManager;
use Drupal\ai\AiVdbProviderPluginManager;
use Drupal\ai_vdb_provider_postgres\PostgresPgvectorClient;
use PgSql\Connection;

/**
 * @todo Add class description.
 */
final class VdbEmbeddings {

  /**
   * AI provider plugin manager.
   *
   * @var \PgSql\Connection
   */
  protected Connection $connection;


  /**
   * Constructs a VdbEmbeddings object.
   */
  public function __construct(
    private readonly AiVdbProviderPluginManager $aiVdbProvider,
    private readonly AiProviderPluginManager $aiProvider,
    private readonly PostgresPgvectorClient $aiVdbProviderPostgresClient,
    private readonly LoggerChannelFactoryInterface $loggerFactory,
    private readonly ConfigFactoryInterface $configFactory,
  ) {
    $config = $this->configFactory->get('ai_vdb_provider_postgres.settings');
    $this->connection = $this->aiVdbProviderPostgresClient->getConnection(
      $config->get('host'),
      $config->get('port') ?? 5432,
      $config->get('username'),
      $config->get('password'),
      $config->get('default_database')
    );
  }

  /**
   * @todo Add method description.
   */
  public function createEntityEmbedding(EntityInterface $entity, string $chunk) {

    $this->aiVdbProviderPostgresClient->insertIntoCollection(
      'embeddings',
      ['value' => $entity->id(), 'is_multiple' => FALSE],
      ['value' => $entity->id(), 'is_multiple' => FALSE],
      ['value' => $chunk, 'is_multiple' => FALSE],
      ['value' => $this->createVector($chunk), 'is_multiple' => FALSE],
      ['value' => 'chat_ai', 'is_multiple' => FALSE],
      ['value' => 'chat_ai_index', 'is_multiple' => FALSE],
      [],
      $this->connection,
    );
  }

  /**
   * @todo Add method description.
   */
  public function createVector(string $chunk) {
    /** @var \Drupal\ai\OperationType\Embeddings\EmbeddingsOutput $vector_object */
    $vector_object =  $this->aiProvider->createInstance('amazeeio')->Embeddings($chunk, 'embeddings', ['chat-ai']);
    return $vector_object->getNormalized();
  }

  /**
   * @todo Add method description.
   */
  public function removeEmbedding() {
    // @todo Place your code here.
  }

  /**
   * @todo Add method description.
   */
  public function vectorSearch(string $input) {
    // @todo Place your code here.
  }


  public function removeEntityEmbedding(EntityInterface $entity) {
    $this->aiVdbProviderPostgresClient->deleteFromCollection(
      'embeddings',
      [$entity->id()],
      $this->connection,
    );
  }
}
