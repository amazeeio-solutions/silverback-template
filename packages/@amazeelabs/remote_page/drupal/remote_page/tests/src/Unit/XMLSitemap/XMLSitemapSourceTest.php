<?php

namespace Drupal\Tests\remote_page\Unit\XMLSitemap;

use Drupal\Tests\UnitTestCase;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\Core\Logger\LoggerChannelInterface;
use Drupal\Tests\remote_page\Unit\XMLSitemap\TestXMLSitemapSource;

class XMLSitemapSourceTest extends UnitTestCase {

  /**
   * The logger factory.
   *
   * @var \Drupal\Core\Logger\LoggerChannelFactoryInterface|\PHPUnit\Framework\MockObject\MockObject
   */
  protected $loggerFactory;

  /**
   * The logger channel.
   *
   * @var \Drupal\Core\Logger\LoggerChannelInterface|\PHPUnit\Framework\MockObject\MockObject
   */
  protected $logger;

  /**
   * The XML sitemap source object to test.
   *
   * This is a subclass of the XMLSitemapSource class because we need to
   * override the getContentFromUrl method which can contain urls that
   * are not accessible.
   *
   * @var \Drupal\Tests\remote_page\Unit\XMLSitemap\TestXMLSitemapSource
   */
  protected $xmlSitemapSource;

  public function setUp(): void {
    parent::setUp();
    $this->logger = $this->createMock(LoggerChannelInterface::class);
    $this->loggerFactory = $this->createMock(LoggerChannelFactoryInterface::class);
    $this->loggerFactory->expects($this->any())
      ->method('get')
      ->willReturn($this->logger);
    $this->xmlSitemapSource = new TestXMLSitemapSource($this->loggerFactory);
  }

  /**
   * Data provider for testListXmlSitemaps.
   *
   * @return array
   *   Array of test cases, each containing:
   *   - string $sitemapFile: Path to the sitemap file
   *   - array $expectedUrls: Expected list of URLs
   *   - string $message: Test case description
   */
  public function listXmlSitemapsProvider(): array {
    return [
      'sitemap index' => [
        __DIR__ . '/files/sitemap-index.xml',
        [
          __DIR__ . '/files/sitemap-entries.xml',
          __DIR__ . '/files/sitemap-more-entries.xml',
        ],
        'Testing listing XML sitemaps from a sitemap index file',
      ],
      'single sitemap' => [
        __DIR__ . '/files/sitemap-entries.xml',
        [__DIR__ . '/files/sitemap-entries.xml'],
        'Testing listing XML sitemaps from a single sitemap file',
      ],
    ];
  }

  /**
   * Tests listing XML sitemaps.
   *
   * @dataProvider listXmlSitemapsProvider
   */
  public function testListXmlSitemaps(string $sitemapFile, array $expectedUrls, string $message) {
    $sitemapUrls = $this->xmlSitemapSource->listXmlSitemaps($sitemapFile);
    $this->assertEquals($expectedUrls, $sitemapUrls, $message);
  }

  /**
   * Data provider for testGetXmlSitemapEntries.
   *
   * @return array
   *   Array of test cases, each containing:
   *   - string $sitemapFile: Path to the sitemap file
   *   - array $expectedEntries: Expected list of entries
   *   - string $message: Test case description
   */
  public function getXmlSitemapEntriesProvider(): array {
    return [
      'basic sitemap' => [
        __DIR__ . '/files/sitemap-entries.xml',
        [
          [
            'url' => 'https://www.example.com/1',
            'lastmod' => '2025-06-04T07:49:13.942Z',
            'changefreq' => NULL,
          ],
          [
            'url' => 'https://www.example.com/2',
            'lastmod' => '2025-06-04T07:49:13.943Z',
            'changefreq' => NULL,
          ],
          [
            'url' => 'https://www.example.com/3',
            'lastmod' => '2025-06-04T07:49:13.943Z',
            'changefreq' => NULL,
          ],
        ],
        'Testing getting entries from a basic sitemap file',
      ],
      'sitemap with changefreq' => [
        __DIR__ . '/files/sitemap-more-entries.xml',
        [
          [
            'url' => 'https://www.example.com/10',
            'lastmod' => '2025-06-05T07:49:13.942Z',
            'changefreq' => 'daily',
          ],
          [
            'url' => 'https://www.example.com/11',
            'lastmod' => '2025-06-07T07:49:13.943Z',
            'changefreq' => 'monthly',
          ],
          [
            'url' => 'https://www.example.com/12',
            'lastmod' => '2025-06-09T07:49:13.943Z',
            'changefreq' => 'weekly',
          ],
        ],
        'Testing getting entries from a sitemap file with changefreq',
      ],
      'sitemap index' => [
        __DIR__ . '/files/sitemap-index.xml',
        [
          [
            'url' => 'https://www.example.com/1',
            'lastmod' => '2025-06-04T07:49:13.942Z',
            'changefreq' => NULL,
          ],
          [
            'url' => 'https://www.example.com/2',
            'lastmod' => '2025-06-04T07:49:13.943Z',
            'changefreq' => NULL,
          ],
          [
            'url' => 'https://www.example.com/3',
            'lastmod' => '2025-06-04T07:49:13.943Z',
            'changefreq' => NULL,
          ],
          [
            'url' => 'https://www.example.com/10',
            'lastmod' => '2025-06-05T07:49:13.942Z',
            'changefreq' => 'daily',
          ],
          [
            'url' => 'https://www.example.com/11',
            'lastmod' => '2025-06-07T07:49:13.943Z',
            'changefreq' => 'monthly',
          ],
          [
            'url' => 'https://www.example.com/12',
            'lastmod' => '2025-06-09T07:49:13.943Z',
            'changefreq' => 'weekly',
          ],
        ],
        'Testing getting entries from a sitemap index file',
      ],
    ];
  }

  /**
   * Tests getting entries from XML sitemaps.
   *
   * @dataProvider getXmlSitemapEntriesProvider
   */
  public function testGetXmlSitemapEntries(string $sitemapFile, array $expectedEntries, string $message) {
    $entries = $this->xmlSitemapSource->getXmlSitemapEntries($sitemapFile);
    $this->assertEquals($expectedEntries, $entries, $message);
  }

  /**
   * Tests handling of invalid XML file.
   */
  public function testInvalidXmlFile() {
    $invalidFile = __DIR__ . '/files/sitemap-invalid.xml';
    $entries = $this->xmlSitemapSource->getXmlSitemapEntries($invalidFile);
    $this->assertEmpty($entries);
  }

  /**
   * Tests handling of non-existent file.
   */
  public function testNonExistentFile() {
    $nonExistentFile = __DIR__ . '/files/non-existent.xml';
    $entries = $this->xmlSitemapSource->getXmlSitemapEntries($nonExistentFile);
    $this->assertEmpty($entries);
  }
}
