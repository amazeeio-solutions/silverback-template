<?php

namespace Drupal\Tests\remote_page\Kernel;

use Drupal\KernelTests\KernelTestBase;
use Drupal\remote_page\Entity\RemotePage;

/**
 * Tests the RemotePageSync service.
 *
 * @group remote_page
 */
class RemotePageSyncTest extends KernelTestBase {

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'remote_page',
  ];

  /**
   * The remote page sync service.
   *
   * @var \Drupal\remote_page\RemotePageSync
   */
  protected $remotePageSync;

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();

    $this->installEntitySchema('remote_page');
    $this->remotePageSync = $this->container->get('remote_page.sync');
  }

  /**
   * Tests bulk syncing of new pages.
   */
  public function testBulkSync() {
    $remotePages = [
      [
        'url' => 'https://example.com/page1',
        'lastmod' => '2024-01-01',
        'changefreq' => 'daily',
      ],
      [
        'url' => 'https://example.com/page2',
        'lastmod' => '2024-01-02',
        'changefreq' => 'weekly',
      ],
    ];
    $lastSeenIndex = 1;
    $this->remotePageSync->bulkSync($remotePages, $lastSeenIndex);

    // Verify the results
    $entities = RemotePage::loadMultiple();
    $this->assertCount(2, $entities);

    $firstEntity = reset($entities);
    if ($firstEntity->get('url')->value === 'https://example.com/page1') {
      $entity1 = $firstEntity;
      $entity2 = next($entities);
    }
    else {
      $entity1 = next($entities);
      $entity2 = $firstEntity;
    }

    // Check first entity
    $this->assertEquals('https://example.com/page1', $entity1->get('url')->value);
    $this->assertEquals('2024-01-01', $entity1->get('lastmod')->value);
    $this->assertEquals('daily', $entity1->get('changefreq')->value);
    $this->assertEquals($lastSeenIndex, $entity1->get('lastseenindex')->value);

    // Check second entity
    $this->assertEquals('https://example.com/page2', $entity2->get('url')->value);
    $this->assertEquals('2024-01-02', $entity2->get('lastmod')->value);
    $this->assertEquals('weekly', $entity2->get('changefreq')->value);
    $this->assertEquals($lastSeenIndex, $entity2->get('lastseenindex')->value);
  }

  /**
   * Tests bulk syncing with missing lastmod dates.
   */
  public function testBulkSyncWithMissingLastmod() {
    // Test data with missing lastmod
    $remotePages = [
      [
        'url' => 'https://example.com/page1',
        'changefreq' => 'daily',
      ],
    ];
    $lastSeenIndex = 1;

    // Execute the sync
    $this->remotePageSync->bulkSync($remotePages, $lastSeenIndex);

    // Verify the results
    $entities = RemotePage::loadMultiple();
    $this->assertCount(1, $entities);

    $entity = reset($entities);
    $this->assertEquals('https://example.com/page1', $entity->get('url')->value);
    $this->assertEquals('daily', $entity->get('changefreq')->value);
    $this->assertEquals($lastSeenIndex, $entity->get('lastseenindex')->value);

    // Verify that lastmod was set to current date
    $this->assertNotEmpty($entity->get('lastmod')->value);
    $currentDay = date('Y-m-d 00:00:00');
    $this->assertEquals($currentDay, $entity->get('lastmod')->value);
  }

  /**
   * Tests bulk syncing with existing pages.
   */
  public function testBulkSyncWithExistingPages() {
    // Create an existing page
    $existingPage = RemotePage::create([
      'url' => 'https://example.com/page1',
      'lastmod' => '2024-01-01',
      'changefreq' => 'daily',
      'lastseenindex' => 0,
      'host' => 'example_com',
    ]);
    $existingPage->save();

    // Test data
    $remotePages = [
      [
        'url' => 'https://example.com/page1',
        'lastmod' => '2024-01-01',
        'changefreq' => 'daily',
      ],
    ];
    $lastSeenIndex = 1;

    // Execute the sync
    $this->remotePageSync->bulkSync($remotePages, $lastSeenIndex);

    // Verify the results
    $entities = RemotePage::loadMultiple();
    $this->assertCount(1, $entities);

    $entity = reset($entities);
    $this->assertEquals('https://example.com/page1', $entity->get('url')->value);
    $this->assertEquals('2024-01-01', $entity->get('lastmod')->value);
    $this->assertEquals('daily', $entity->get('changefreq')->value);
    $this->assertEquals($lastSeenIndex, $entity->get('lastseenindex')->value);
  }

  /**
   * Tests bulk syncing with updated content.
   */
  public function testBulkSyncWithUpdatedContent() {
    // Create an existing page
    $existingPage = RemotePage::create([
      'url' => 'https://example.com/page1',
      'lastmod' => '2024-01-01',
      'changefreq' => 'daily',
      'lastseenindex' => 0,
      'host' => 'example_com',
    ]);
    $existingPage->save();

    // Test data with updated content
    $remotePages = [
      [
        'url' => 'https://example.com/page1',
        'lastmod' => '2024-01-02', // Updated lastmod
        'changefreq' => 'weekly', // Updated changefreq
      ],
    ];
    $lastSeenIndex = 1;

    // Execute the sync
    $this->remotePageSync->bulkSync($remotePages, $lastSeenIndex);

    // Verify the results
    $entities = RemotePage::loadMultiple();
    $this->assertCount(1, $entities);

    $entity = reset($entities);
    $this->assertEquals('https://example.com/page1', $entity->get('url')->value);
    $this->assertEquals('2024-01-02', $entity->get('lastmod')->value);
    $this->assertEquals('weekly', $entity->get('changefreq')->value);
    $this->assertEquals($lastSeenIndex, $entity->get('lastseenindex')->value);
  }

  /**
   * Tests bulk syncing with deleted remote entities.
   */
  public function testBulkSyncWithDeletedRemoteEntities() {
    // Create some remote pages
    RemotePage::create([
      'url' => 'https://example.com/page1',
      'lastmod' => '2024-01-01',
      'changefreq' => 'daily',
      'host' => 'example_com',
      'lastseenindex' => 0,
    ])->save();

    RemotePage::create([
      'url' => 'https://example.com/page2',
      'lastmod' => '2024-01-02',
      'changefreq' => 'weekly',
      'host' => 'example_com',
      'lastseenindex' => 0,
    ])->save();

    $remotePages = [
      [
        'url' => 'https://example.com/page1',
        'lastmod' => '2024-01-01',
        'changefreq' => 'daily',
      ],
    ];
    $lastSeenIndex = 1;

    // Execute the sync with only one page (page2 is deleted from the source).
    $this->remotePageSync->bulkSync($remotePages, $lastSeenIndex);

    // Verify the results. Page1 should have the updated lastseenindex to 1,
    // while page2 should have the lastseenindex to 0.
    $entities = RemotePage::loadMultiple();
    $this->assertCount(2, $entities);

    $firstEntity = reset($entities);
    if ($firstEntity->get('url')->value === 'https://example.com/page1') {
      $entity1 = $firstEntity;
      $entity2 = next($entities);
    }
    else {
      $entity1 = next($entities);
      $entity2 = $firstEntity;
    }

    $this->assertEquals(1, $entity1->get('lastseenindex')->value);
    $this->assertEquals(0, $entity2->get('lastseenindex')->value);
  }
}
