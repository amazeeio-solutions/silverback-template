<?php

namespace Drupal\Tests\remote_page\Kernel;

use Drupal\KernelTests\KernelTestBase;

/**
 * Tests the Cleanup service.
 *
 * @group remote_page
 */
class CleanupTest extends KernelTestBase {

  protected static $modules = [
    'remote_page',
  ];

  /**
   * The cleanup service.
   *
   * @var \Drupal\remote_page\Cleanup
   */
  protected $cleanup;

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
    $this->cleanup = $this->container->get('remote_page.cleanup');
    $this->remotePageSync = $this->container->get('remote_page.sync');
  }

  /**
   * Tests the getMaxLastSeenIndex() method.
   */
  public function testGetMaxLastSeenIndex() {
    $cleanupReflection = new \ReflectionClass($this->cleanup);
    $getMaxLastSeenIndex = $cleanupReflection->getMethod('getMaxLastSeenIndex');
    $getMaxLastSeenIndex->setAccessible(true);

    // Import first 2 remote pages.
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

    // Update on remote page and increse the lastseenindex.
    $remotePages = [
      [
        'url' => 'https://example.com/page2',
        'lastmod' => '2024-01-02',
        'changefreq' => 'weekly',
      ],
    ];
    $lastSeenIndex = 2;
    $this->remotePageSync->bulkSync($remotePages, $lastSeenIndex);

    $this->assertEquals(2, $getMaxLastSeenIndex->invoke($this->cleanup));
  }

  public function testGetNextIdsForCleanup() {
    $cleanupReflection = new \ReflectionClass($this->cleanup);
    $getNextIdsForCleanup = $cleanupReflection->getMethod('getNextIdsForCleanup');
    $getNextIdsForCleanup->setAccessible(true);

    // Import first 4 remote pages.
    $remotePages = [
      [
        'rpid' => 1,
        'url' => 'https://example.com/page1',
        'lastmod' => '2024-01-01',
        'changefreq' => 'daily',
      ],
      [
        'rpid' => 2,
        'url' => 'https://example.com/page2',
        'lastmod' => '2024-01-02',
        'changefreq' => 'weekly',
      ],
      [
        'rpid' => 3,
        'url' => 'https://example.com/page3',
        'lastmod' => '2024-01-03',
        'changefreq' => 'monthly',
      ],
      [
        'rpid' => 4,
        'url' => 'https://example.com/page4',
        'lastmod' => '2024-01-04',
        'changefreq' => 'yearly',
      ],
      [
        'rpid' => 5,
        'url' => 'https://example.com/page5',
        'lastmod' => '2024-01-05',
        'changefreq' => 'yearly',
      ],
    ];
    $lastSeenIndex = 1;
    $this->remotePageSync->bulkSync($remotePages, $lastSeenIndex);

    $this->assertEquals([], $getNextIdsForCleanup->invoke($this->cleanup, 0, 0, 100));

    // Update pages 1 and page 4 now.
    $remotePages = [
      [
        'url' => 'https://example.com/page1',
        'lastmod' => '2024-01-01',
        'changefreq' => 'daily',
      ],
      [
        'url' => 'https://example.com/page4',
        'lastmod' => '2024-01-04',
        'changefreq' => 'yearly',
      ],
    ];
    $lastSeenIndex = 2;
    $this->remotePageSync->bulkSync($remotePages, $lastSeenIndex);

    // Test with the batch size of 100, which would return all the remote pages
    // proposed to be deleted.
    $this->assertEquals([2 => '2', 3 => '3', 5 => '5'], $getNextIdsForCleanup->invoke($this->cleanup, 0, 1, 100));

    // Same test, with the batch size off 2.
    $this->assertEquals([2 => '2', 3 => '3'], $getNextIdsForCleanup->invoke($this->cleanup, 0, 1, 2));
    $this->assertEquals([5 => '5'], $getNextIdsForCleanup->invoke($this->cleanup, 3, 1, 2));
  }
}
