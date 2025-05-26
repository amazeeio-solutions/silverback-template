<?php

namespace Drupal\chat_ai\Plugin\QueueWorker;

use Drupal\Core\Queue\QueueWorkerBase;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use LLPhant\Embeddings\Document;
use LLPhant\Embeddings\DocumentSplitter\DocumentSplitter;
use League\HTMLToMarkdown\HtmlConverter;

/**
 * Defines 'embeddings_queue' queue worker.
 *
 * @QueueWorker(
 *   id = "embeddings_queue",
 *   title = @Translation("Embeddings Queue Worker"),
 *   cron = {"time" = 600}
 * )
 */
class EmbeddingsQueue extends QueueWorkerBase {

  use StringTranslationTrait;

  /**
   * {@inheritdoc}
   */
  public function processItem($data) {
    /** @var \Drupal\Core\Entity\ContentEntityInterface $entity */
    $entity = $data->entity;

    $embeddings = \Drupal::service('chat_ai.vdb.embeddings');

    if (PHP_SAPI === 'cli') {
      print "Indexing entity: {$entity->url->value}" . PHP_EOL;
    }

    $fetcher = \Drupal::service('chat_ai.content_fetcher');

    if (!$entity->url->value) {
      \Drupal::logger('chat_ai')->error($this->t('Entity with @id has empty URL value', [
        '@id' => $entity->id(),
      ]));
      return;
    }

    $content = $fetcher->fetchUrl($entity->url->value);
    $document = new Document();
    $document->content = $content;
    $document->sourceName = $entity->url->value;
    $document->hash = \hash('sha256', $content);
    $chunks = DocumentSplitter::splitDocuments([$document], 800, '.', 0);
    $converter = new HtmlConverter();

    $embeddings->removeEmbedding($entity);
    foreach ($chunks as $chunk) {
      $trimmed = trim(strip_tags($chunk->content));
      if (!empty($trimmed)) {
        $cleanHtml = tidy_repair_string($chunk->content, ['input-encoding' => 'utf8', 'output-encoding' => 'utf8']);
        $markdown = $converter->convert($cleanHtml);
        $embeddings->createEntityEmbedding($entity, $markdown);
      }
    }

    if (PHP_SAPI === 'cli') {
      print "Indexing finished ✅" . PHP_EOL;
    }

    \Drupal::logger('chat_ai')->info($this->t('@url indexed successfully', [
      '@url' => $entity->url->value,
    ]));
  }
}
