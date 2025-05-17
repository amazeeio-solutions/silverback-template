<?php

namespace Drupal\silverback_mcp\Plugin\Mcp;

use Drupal\Core\Field\FieldDefinitionInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\StringTranslation\TranslatableMarkup;
use Drupal\mcp\Attribute\Mcp;
use Drupal\mcp\Plugin\McpPluginBase;
use Drupal\mcp\ServerFeatures\Resource;
use Drupal\mcp\ServerFeatures\ResourceTemplate;
use Drupal\mcp\ServerFeatures\Tool;
use Drupal\node\NodeInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Plugin implementation of the mcp.
 */
#[Mcp(
  id: 'silverback-crud',
  name: new TranslatableMarkup('Silverback CRUD'),
  description: new TranslatableMarkup(
    'Provides CRUD MCP integration with Silverback Drupal.'
  ),
)]
final class SilverbackCrud extends McpPluginBase implements ContainerFactoryPluginInterface {

  /**
   * The module handler.
   *
   * @var \Drupal\Core\Extension\ModuleHandlerInterface
   */
  private $moduleHandler;

  /**
   * The entity type manager.
   *
   * @var ?\Drupal\Core\Entity\EntityTypeManagerInterface
   */
  private $entityTypeManager;

  /**
   * {@inheritDoc}
   */
  public static function create(
    ContainerInterface $container,
    array $configuration,
    $plugin_id,
    $plugin_definition,
  ) {
    $instance = parent::create(
      $container,
      $configuration,
      $plugin_id,
      $plugin_definition,
    );

    $instance->moduleHandler = $container->get('module_handler');
    $instance->entityTypeManager = $container->get(
      'entity_type.manager',
      ContainerInterface::NULL_ON_INVALID_REFERENCE
    );
    return $instance;
  }

  /**
   * {@inheritDoc}
   */
  public function checkRequirements(): bool {
    return $this->moduleHandler->moduleExists('node');
  }

  /**
   * {@inheritdoc}
   */
  public function defaultConfiguration(): array {
    $config = parent::defaultConfiguration();

    // Get all available content types and enable them by default.
    $node_types = $this->entityTypeManager->getStorage('node_type')
      ->loadMultiple();

    $config['config']['content_types'] = [];
    foreach ($node_types as $node_type) {
      $config['config']['content_types'][$node_type->id()] = TRUE;
    }

    return $config;
  }

  /**
   * {@inheritdoc}
   */
  public function getTools(): array {
    $tools[] = new Tool(
      name: "createPage",
      description: 'Create a new basic page.',
      inputSchema: [
        'type'       => 'object',
        'properties' => [
          'title' => [
            'type' => 'string',
            'description' => 'The title of the new event.',
          ],
          'body' => [
            'type' => 'string',
            'description' => 'The content (in HTML) of the new event page.',
          ],
          'startDate' => [
            'type' => 'string',
            'description' => 'The start date time of the event, in the following format: 2025-05-21T12:00:00.',
          ],
          'endDate' => [
            'type' => 'string',
            'description' => 'The end date time of the event, in the following format: 2025-05-21T12:00:00.',
          ],
        ],
        'required'   => ['title', 'content'],
      ]
    );
    return $tools;
  }

  /**
   * {@inheritdoc}
   */
  public function executeTool(string $toolId, mixed $arguments): array {
    if ($toolId === md5('createPage')) {
      // @todo
      return [
        'Page created',
      ];
    }
    return [];
  }
}
