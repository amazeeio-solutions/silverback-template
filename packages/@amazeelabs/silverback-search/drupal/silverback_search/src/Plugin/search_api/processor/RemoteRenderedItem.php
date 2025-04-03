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
  private ?string $cached404PageUuid = NULL;
  private ?string $netlifyPassword = NULL;

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
      $this->netlifyPassword = $configuration['netlify_password'];
      if ($this->is404Page($entity)) {
        $html = '';
      } else {
        $html = $this->getHtml($entity, $configuration);
      }
      $field->addValue($html);
      if ($this->isOutdated($entity)) {
        $item->addWarning('The remote rendered item is outdated. Marking the search item as dirty.');
      }
    }
  }

  protected function getFromRemote(string $url): array {
    $response = $this->httpClient->request('GET', $url);
    if ($response->getStatusCode() === 401) {
      if ($this->netlifyPassword) {
        $response = $this->httpClient->request('POST', $url, [
          RequestOptions::FORM_PARAMS => [
            'password' => $this->netlifyPassword,
          ],
        ]);
        if ($response->getStatusCode() === 401) {
          return [
            NULL,
            'Could not fetch from remote because Netlify password is incorrect.',
          ];
        }
      }
      else {
        return [
          NULL,
          'Could not fetch from remote because Netlify password is not set.',
        ];
      }
    }
    if ($response->getStatusCode() !== 200) {
      return [
        NULL,
        'Could not fetch from remote because the response status code is ' . $response->getStatusCode() . '.',
      ];
    }
    return [
      $response->getBody()->getContents(),
      NULL,
    ];
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
    
    [$content, $error] = $this->getFromRemote($liveUrl);
    if ($error) {
      $this->logger->error('Could not get HTML: {error}. Debug:<pre>{debug}</pre>', ['error' => $error, 'debug' => $debug]);
      return '';
    }
    $crawler = new Crawler($content);
    $rootSelector = $configuration['root_selector'] ?: 'body';
    $filtered = $crawler->filter($rootSelector);
    if ($filtered->count() > 0) {
      $result = $filtered->first();
      if (!empty($configuration['exclude_selector'])) {
        $result->filter($configuration['exclude_selector'])->each(function ($node) {
          $node->getNode(0)->parentNode->removeChild($node->getNode(0));
        });
      }
      $html = $result->outerHtml();
      return $html;
    } else {
      $this->logger->error(
        'Root selector `{root_selector}` did not match any elements on the page. Debug:<pre>{debug}</pre>',
        [
          'root_selector' => $rootSelector,
          'debug' => $debug,
        ]
      );
    }
    return '';
  }

  private function isOutdated(ContentEntityInterface $entity): bool {
    $buildId = $this->getBuildId();
    if (!$buildId) {
      return FALSE;
    }
    $count = $this->getUpdateCount($entity->uuid(), $buildId);
    return $count > 0;
  }

  protected function is404Page(ContentEntityInterface $entity): bool {
    if ($this->cached404PageUuid === NULL) {
      try {
        $this->cached404PageUuid = config_pages_config('website_settings')
          ->get('field_404_page')
          ->entity
          ->uuid();
      }
      catch (\Throwable $e) {
        $this->cached404PageUuid = 'Not defined';
      }
    }
    return $entity->uuid() === $this->cached404PageUuid;
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
      [$content, $error] = $this->getFromRemote($buildJsonUrl);
      if ($error) {
        $this->logger->error('Could not get build ID: {error}. URL: {url}', [
          'error' => $error,
          'url' => $buildJsonUrl,
        ]);
        return NULL;
      }
      $buildInfo = json_decode($content, TRUE);
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
