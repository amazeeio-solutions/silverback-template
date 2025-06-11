<?php

declare(strict_types=1);

namespace Drupal\Tests\silverback_test\Kernel\Datasource;

use Drupal\Core\DependencyInjection\ContainerBuilder;
use Drupal\Core\Language\LanguageInterface;
use Drupal\Tests\TestFileCreationTrait;
use Drupal\Tests\media\Kernel\MediaKernelTestBase;
use Drupal\Tests\node\Traits\ContentTypeCreationTrait;
use Drupal\Tests\node\Traits\NodeCreationTrait;
use Drupal\Tests\search_api\Kernel\PostRequestIndexingTrait;
use Drupal\Tests\search_api\Kernel\TestLogger;
use Drupal\field\Entity\FieldConfig;
use Drupal\field\Entity\FieldStorageConfig;
use Drupal\file\Entity\File;
use Drupal\media\Entity\Media;
use Drupal\media\Entity\MediaType;
use Drupal\node\Entity\Node;
use Drupal\node\Entity\NodeType;
use Drupal\search_api\Entity\Index;
use Drupal\search_api\Entity\Server;
use Drupal\search_api\Utility\TrackingHelper;
use Drupal\search_api\Utility\Utility;
use Drupal\silverback_gutenberg\BlockSerializer;

/**
 * Tests that changes in related entities are correctly tracked.
 *
 * @group search_api
 */
class SearchApiIndexUpdateTest extends MediaKernelTestBase {

  use ContentTypeCreationTrait;
  use NodeCreationTrait;
  use TestFileCreationTrait;
  use PostRequestIndexingTrait;

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'node',
    'search_api',
    'search_api_test',
    'search_api_test_example_content_references',
    'media',
    'path_alias',
    'filter',
    'text',
    'silverback_gutenberg',
    'language',
    'content_translation',
    'entity_usage',
    'silverback_search',
    'silverback_external_preview',
  ];

  /**
   * The search index used for this test.
   *
   * @var \Drupal\search_api\IndexInterface
   */
  protected $index;

  /**
   * Entities created for this test, keyed by human-readable string keys.
   *
   * @var \Drupal\Core\Entity\EntityInterface[]
   */
  protected $entities = [];

  /**
   * {@inheritdoc}
   */
  public function setUp(): void {
    parent::setUp();

    $this->installSchema('search_api', ['search_api_item']);
    $this->installSchema('node', ['node_access']);
    $this->installSchema('entity_usage', ['entity_usage']);

    $this->installEntitySchema('node');
    $this->installEntitySchema('search_api_task');
    $this->installConfig([
      'search_api',
      'search_api_test_example_content_references',
    ]);

    $this->installConfig(['filter']);

    // Do not use a batch for tracking the initial items after creating an
    // index when running the tests via the GUI. Otherwise, it seems Drupal's
    // Batch API gets confused and the test fails.
    if (!Utility::isRunningInCli()) {
      \Drupal::state()->set('search_api_use_tracking_batch', FALSE);
    }

    Server::create([
      'id' => 'server',
      'backend' => 'search_api_test',
    ])->save();

    $this->createMediaType('image', ['id' => 'image']);
    $this->container->get('content_translation.manager')->setEnabled(
      'media',
      'image',
      TRUE
    );

    $pageType = NodeType::create(
      [
        'type' => 'page',
        'name' => 'Page',
      ]
    );
    $pageType->save();

    FieldStorageConfig::create([
      'field_name' => 'body',
      'entity_type' => 'node',
      'type' => 'text_long',
      'cardinality' => 1,
    ])->save();
    FieldConfig::create([
      'field_name' => 'body',
      'entity_type' => 'node',
      'bundle' => 'page',
      'label' => 'Body',
    ])->save();

    $this->index = Index::create([
      'id' => 'test_index',
      'name' => 'Test index',
      'tracker_settings' => [
        'default' => [],
      ],
      'datasource_settings' => [
        'entity:node' => [],
        'entity:media' => [],
      ],
      'server' => 'server',
      'field_settings' => [
        'title' => [
          'label' => 'Title',
          'datasource_id' => 'entity:node',
          'property_path' => 'title',
          'type' => 'text',
        ],
        'body' => [
          'label' => 'Body',
          'datasource_id' => 'entity:node',
          'property_path' => 'body',
          'type' => 'text',
        ],
      ],
    ]);

    $this->index->save();
  }

  /**
   * {@inheritdoc}
   */
  public function register(ContainerBuilder $container): void {
    parent::register($container);

    // Set a logger that will throw exceptions when warnings/errors are logged.
    $logger = new TestLogger('');
    $container->set('logger.factory', $logger);
    $container->set('logger.channel.search_api', $logger);
    $container->set('logger.channel.search_api_db', $logger);
  }

  /**
   * Tests correct tracking of changes in referenced entities.
   *
   */
  public function testReferencedEntityChangedGutenbergBlock() {

    $file1 = File::create([
      'uri' => $this->getTestFiles('image')[0]->uri,
    ]);
    $file1->save();

    $file2 = File::create([
      'uri' => $this->getTestFiles('image')[1]->uri,
    ]);
    $file2->save();

    $media = Media::create([
      'bundle' => 'image',
      'name' => 'Screaming hairy armadillo',
      'field_media_image' => [
        [
          'target_id' => $file1->id(),
          'alt' => 'Screaming hairy armadillo',
          'title' => 'Screaming hairy armadillo',
        ],
      ],
    ]);
    $media->save();

    $serializer = new BlockSerializer();
    $blocks = [
      [
        'blockName' => 'core/paragraph',
        'innerContent' => ['<p>A test paragraph</p>'],
        'attrs' => [],
        'innerBlocks' => [],
        'innerHTML' => [],
      ],
      [
        'blockName' => 'drupalmedia/drupal-media-entity',
        'attrs' => [
          'caption' => 'This is the caption',
          'mediaEntityIds' => [$media->id()],
        ],
        'innerContent' => [],
        'innerBlocks' => [],
        'innerHTML' => [],
      ]
    ];

    $html = $serializer->serialize_blocks($blocks);

    $node = Node::create([
      'type' => 'page',
      'title' => 'Editor test',
      'body' => $html,
    ]);
    $node->save();

    $this->index->indexItems();
    $tracker = $this->index->getTrackerInstance();

    $this->assertEquals(
      [],
      $tracker->getRemainingItems(),
      '⚠️ Initial index matching error (1)',
    );

    $media->set('field_media_image', ['target_id' => $file2->id()]);
    $media->save();

    // $this->index->indexItems();
    // $tracker->trackAllItemsUpdated(['1']);

    $expected[] = Utility::createCombinedId('entity:media', $media->id() . ':en');
    $expected[] = Utility::createCombinedId('entity:node', $node->id() . ':en');

    $this->assertEquals(
      $expected,
      $tracker->getRemainingItems(),
      '⚠️ Media update index matching error (2)',
    );

    // Make sure that no unknown items were queued for post-request indexing.
    $this->triggerPostRequestIndexing();
  }
}
