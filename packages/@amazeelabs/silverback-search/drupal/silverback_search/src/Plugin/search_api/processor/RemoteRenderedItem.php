<?php

namespace Drupal\silverback_search\Plugin\search_api\processor;

use Drupal\Core\Database\Connection;
use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\search_api\Datasource\DatasourceInterface;
use Drupal\search_api\Item\ItemInterface;
use Drupal\search_api\Processor\ProcessorPluginBase;
use Drupal\silverback_external_preview\ExternalPreviewLink;
use Drupal\silverback_search\Plugin\search_api\processor\Property\RemoteRenderedItemProperty;
use GuzzleHttp\Client;
use GuzzleHttp\Cookie\CookieJar;
use GuzzleHttp\RequestOptions;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\DomCrawler\Crawler;

/**
 * @SearchApiProcessor(
 *   id = "silverback_remote_rendered_item",
 *   label = @Translation("Remote rendered item (Silverback)"),
 *   description = @Translation("Adds an additional field containing the remotely rendered item."),
 *   stages = {
 *     "add_properties" = 0,
 *   },
 *   locked = true,
 *   hidden = true,
 * )
 */
class RemoteRenderedItem extends ProcessorPluginBase {

  protected ExternalPreviewLink $externalPreviewLink;
  protected Client $httpClient;
  protected LoggerInterface $logger;
  protected Connection $database;
  
  private ?int $cachedBuildId = NULL;

  public function __construct(
    array $configuration,
    $plugin_id,
    array $plugin_definition,
    ExternalPreviewLink $external_preview_link,
    LoggerInterface $logger,
    $database
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->externalPreviewLink = $external_preview_link;
    $this->logger = $logger;
    $this->database = $database;
    $this->httpClient = new Client([
      RequestOptions::HTTP_ERRORS => FALSE,
      RequestOptions::COOKIES => new CookieJar(),
      RequestOptions::TIMEOUT => 5,
    ]);
  }

  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('silverback_external_preview.external_preview_link'),
      $container->get('logger.factory')->get('silverback_search'),
      $container->get('database'),
    );
  }

  public function getPropertyDefinitions(?DatasourceInterface $datasource = NULL) {
    $properties = [];

    if (!$datasource) {
      $definition = [
        'label' => $this->t('Remote rendered HTML output (Silverback)'),
        'description' => $this->t('The complete HTML fetched from remote source'),
        'type' => 'search_api_html',
        'processor_id' => $this->getPluginId(),
      ];
      $properties['silverback_remote_rendered_item'] = new RemoteRenderedItemProperty($definition);
    }

    return $properties;
  }

  public function addFieldValues(ItemInterface $item) {
    $fields = $this->getFieldsHelper()
      ->filterForPropertyPath($item->getFields(), NULL, 'silverback_remote_rendered_item');
    foreach ($fields as $field) {
      $configuration = $field->getConfiguration();
      $entity = $item->getOriginalObject()?->getValue();
      if (!($entity instanceof ContentEntityInterface)) {
        continue;
      }
      if (!in_array($entity->getEntityTypeId(), $configuration['entity_types'], TRUE)) {
        continue;
      }
      $html = $this->getHtml($entity, $configuration);
      $field->addValue($html);
      if ($this->isOutdated($entity)) {
        $item->addWarning('The remote rendered item is outdated. Marking the search item as dirty.');
      }
    }
  }

  private function getHtml(ContentEntityInterface $entity, array $configuration): string {
    $liveUrl = $this->externalPreviewLink->createPreviewUrlFromEntity($entity, 'live')?->toString();
    if (!$liveUrl) {
      return '';
    }

    $debug = json_encode([
      'entity_type' => $entity->getEntityTypeId(),
      'entity_id' => $entity->id(),
      'live_url' => $liveUrl,
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    
    try {
      $response = $this->httpClient->get($liveUrl);
      if ($response->getStatusCode() === 401) {
        if ($configuration['netlify_password']) {
          $response = $this->httpClient->request('POST', $liveUrl, [
            RequestOptions::FORM_PARAMS => [
              'password' => $configuration['netlify_password'],
            ],
          ]);
          if ($response->getStatusCode() === 401) {
            $this->logger->error(
              'Could not fetch the remote rendered item because Netlify password is incorrect. Debug:<pre>{debug}</pre>',
              [
                'debug' => $debug,
              ]
            );
            return '';
          }
        }
        else {
          $this->logger->error(
            'Could not fetch the remote rendered item because Netlify password is not set. Debug:<pre>{debug}</pre>',
            [
              'debug' => $debug,
            ]
          );
          return '';
        }
      }

      if ($response->getStatusCode() === 200) {
        $html = $response->getBody()->getContents();
        $crawler = new Crawler($html);
        $rootSelector = $configuration['root_selector'] ?: 'body';
        $filtered = $crawler->filter($rootSelector);
        if ($filtered->count() > 0) {
          $html = $filtered->first()->outerHtml();
          return $html;
        } else {
          $this->logger->error(
            'Root selector `{root_selector}` did not match any elements on the page. Debug:<pre>{debug}</pre>',
            [
              'root_selector' => $rootSelector,
              'debug' => $debug,
            ]
          );
          return '';
        }
      } else {
        $this->logger->error(
          'Could not fetch the remote rendered item because the response status code is {status_code}. Debug:<pre>{debug}</pre>',
          [
            'status_code' => $response->getStatusCode(),
            'debug' => $debug,
          ]
        );
        return '';
      }
    }
    catch (\Throwable $e) {
      $this->logger->error(
        'Could not fetch the remote rendered item because of an error: {error}. Debug:<pre>{debug}</pre>',
        [
          'error' => $e->getMessage(),
          'debug' => $debug,
        ]
      );
      return '';
    }

    return '';
  }

  private function isOutdated(ContentEntityInterface $entity): bool {
    $buildId = $this->getBuildId();
    if (!$buildId) {
      return FALSE;
    }
    return $this->getUpdateCount($entity->uuid(), $buildId) > 0;
  }

  protected function getUpdateCount(string $entityUuid, int $buildId): int {
    return (int) $this->database->select('gatsby_update_log', 'gul')
      ->condition(
        $this->database->condition('OR')
          ->condition('object_id', $entityUuid)
          ->condition('object_id', $entityUuid . ':%', 'LIKE')
      )
      ->condition('id', $buildId, '>')
      ->countQuery()
      ->execute()
      ->fetchField();
  }

  private function getBuildId(): ?int {
    if ($this->cachedBuildId !== NULL) {
      return $this->cachedBuildId;
    }
    try {
      $buildJsonUrl = $this->externalPreviewLink->getLiveBaseUrl() . '/build.json';
      $response = $this->httpClient->get($buildJsonUrl);
      if ($response->getStatusCode() !== 200) {
        $this->logger->error('Could not check if the remote rendered item is outdated because the build.json response status code is {status_code}. URL: {url}', [
          'status_code' => $response->getStatusCode(),
          'url' => $buildJsonUrl,
        ]);
        return NULL;
      }
      $buildInfo = json_decode($response->getBody()->getContents(), TRUE);
      if (!isset($buildInfo['drupalBuildId'])) {
        return NULL;
      }
      $buildId = (int) $buildInfo['drupalBuildId'];
      if (!$buildId) {
        return NULL;
      }
      $this->cachedBuildId = $buildId;
      return $buildId;
    }
    catch (\Throwable $e) {
      $this->logger->error('Could not fetch build ID: {error}', ['error' => $e->getMessage()]);
      return NULL;
    }
  }

}
