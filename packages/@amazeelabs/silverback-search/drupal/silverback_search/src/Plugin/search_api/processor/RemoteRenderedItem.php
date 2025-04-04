<?php

namespace Drupal\silverback_search\Plugin\search_api\processor;

use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\search_api\Datasource\DatasourceInterface;
use Drupal\search_api\Item\ItemInterface;
use Drupal\search_api\Processor\ProcessorPluginBase;
use Drupal\silverback_search\Plugin\search_api\processor\Property\RemoteRenderedItemProperty;
use Drupal\silverback_search\Service\RemoteFrontend;
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

  private ?string $cached404PageUuid = NULL;

  public function __construct(
    array $configuration,
    $plugin_id,
    array $plugin_definition,
    protected LoggerInterface $logger,
    protected RemoteFrontend $remoteFrontend
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
  }

  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('logger.factory')->get('silverback_search'),
      $container->get('silverback_search.remote_frontend'),
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
      $this->remoteFrontend->setNetlifyPassword($configuration['netlify_password']);
      if ($this->is404Page($entity)) {
        $html = '';
      } else {
        $html = $this->getHtml($entity, $configuration);
      }
      $field->addValue($html);
      if ($this->remoteFrontend->isOutdated($entity)) {
        $item->addWarning('The remote rendered item is outdated. Marking the search item as dirty.');
      }
    }
  }

  private function getHtml(ContentEntityInterface $entity, array $configuration): string {
    $debug = json_encode([
      'entity_type' => $entity->getEntityTypeId(),
      'entity_id' => $entity->id(),
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    
    $result = $this->remoteFrontend->getEntityHtml($entity);
    if ($result->error) {
      $this->logger->error('Could not get HTML: {error}. Debug:<pre>{debug}</pre>', ['error' => $result->error, 'debug' => $debug]);
      return '';
    }
    $crawler = new Crawler($result->content);
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
      return '';
    }
  }

  /**
   * Checks if an entity is the 404 page.
   *
   * @param \Drupal\Core\Entity\ContentEntityInterface $entity
   *   The entity to check.
   *
   * @return bool
   *   TRUE if the entity is the 404 page, FALSE otherwise.
   */
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
}
