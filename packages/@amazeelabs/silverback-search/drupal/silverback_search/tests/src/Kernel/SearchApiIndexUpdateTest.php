<?php

declare(strict_types=1);

namespace Drupal\Tests\silverback_test\Kernel\Datasource;

use Drupal\Tests\TestFileCreationTrait;
use Drupal\Tests\media\Kernel\MediaKernelTestBase;
use Drupal\Tests\node\Traits\ContentTypeCreationTrait;
use Drupal\Tests\node\Traits\NodeCreationTrait;
use Drupal\Tests\search_api\Kernel\PostRequestIndexingTrait;
use Drupal\field\Entity\FieldConfig;
use Drupal\field\Entity\FieldStorageConfig;
use Drupal\file\Entity\File;
use Drupal\media\Entity\Media;
use Drupal\node\Entity\Node;
use Drupal\node\Entity\NodeType;
use Drupal\search_api\Entity\Index;
use Drupal\search_api\Entity\Server;
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
    'media',
    'path_alias',
    'filter',
    'text',
    'silverback_gutenberg',
    //'language',
    // 'content_translation',
    'entity_usage',
    'silverback_external_preview',
    'silverback_search',
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
    $this->installConfig(['search_api', 'filter']);

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

    // Direct entity reference field
    FieldStorageConfig::create([
      'field_name' => 'field_media',
      'entity_type' => 'node',
      'type' => 'entity_reference',
      'cardinality' => 1,
    ])->save();
    FieldConfig::create([
      'field_name' => 'field_media',
      'entity_type' => 'node',
      'bundle' => 'page',
      'label' => 'Media reference direct',
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
   * Tests correct tracking of changes in referenced entities inside gutenberg blocks.
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
      'title' => 'Media Gutenberg reference item test',
      'body' => $html,
    ]);
    $node->save();

    $this->index->indexItems();
    $tracker = $this->index->getTrackerInstance();

    $this->assertEquals($tracker->getIndexedItemsCount(), 2);

    $this->assertEquals(
      [],
      $tracker->getRemainingItems(),
      '⚠️ Initial index matching error (1)',
    );

    // Updating the media will also trigger the re-index of the node.
    $media->set('field_media_image', ['target_id' => $file2->id()]);
    $media->save();

    $expected[] = Utility::createCombinedId('entity:media', $media->id() . ':en');
    $expected[] = Utility::createCombinedId('entity:node', $node->id() . ':en');

    $this->assertEquals(
      $expected,
      $tracker->getRemainingItems(),
      '⚠️ After media update index matching error (2)',
    );

    // Make sure that no unknown items were queued for post-request indexing.
    $this->triggerPostRequestIndexing();
  }

  /**
   * Tests correct tracking of changes in referenced entities outside gutenberg blocks.
   */
  public function testReferencedEntityChangedDirect() {

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

    $node = Node::create([
      'type' => 'page',
      'title' => 'Media reference item test',
      'body' => 'Body value',
      'field_media' => ['target_id' => $media->id()],
    ]);
    $node->save();

    $this->index->indexItems();
    $tracker = $this->index->getTrackerInstance();

    $this->assertEquals($tracker->getIndexedItemsCount(), 2);

    $this->assertEquals(
      [],
      $tracker->getRemainingItems(),
      '⚠️ Initial index matching error (1)',
    );

    $media->set('field_media_image', ['target_id' => $file2->id()]);
    $media->save();

    $expected[] = Utility::createCombinedId('entity:media', $media->id() . ':en');
    $expected[] = Utility::createCombinedId('entity:node', $node->id() . ':en');

    $this->assertEquals(
      $expected,
      $tracker->getRemainingItems(),
      '⚠️ After media update index matching error (2)',
    );
  }
}
