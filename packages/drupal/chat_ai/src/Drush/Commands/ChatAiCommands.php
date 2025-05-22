<?php

namespace Drupal\chat_ai\Drush\Commands;

use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\node\Entity\Node;
use Drupal\chat_ai\Entity\ExternalPage;
use Drush\Attributes as CLI;
use Drush\Commands\DrushCommands;
use GuzzleHttp\ClientInterface;
use GuzzleHttp\Exception\RequestException;
use Symfony\Component\DependencyInjection\ContainerInterface;


/**
 * Drush command to process sitemap URLs.
 */
final class ChatAiCommands extends DrushCommands {

  /**
   * The HTTP client.
   */
  protected ClientInterface $httpClient;

  /**
   * The logger factory.
   */
  protected LoggerChannelFactoryInterface $loggerFactory;

  /**
   * Constructs a SitemapProcessorCommands object.
   *
   * @param \GuzzleHttp\ClientInterface $http_client
   *   The HTTP client.
   * @param \Drupal\Core\Logger\LoggerChannelFactoryInterface $logger_factory
   *   The logger factory.
   */
  public function __construct(ClientInterface $http_client, LoggerChannelFactoryInterface $logger_factory) {
    parent::__construct();
    $this->httpClient = $http_client;
    $this->loggerFactory = $logger_factory;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container): self {
    return new static(
      $container->get('http_client'),
      $container->get('logger.factory')
    );
  }

  /**
   * Process a sitemap and iterate through its URLs.
   *
   * @param string $sitemap_url
   *   The URL of the sitemap to process.
   * @param array $options
   *   An associative array of options.
   */
  #[CLI\Command(name: 'sitemap:process', aliases: ['sp'])]
  #[CLI\Argument(name: 'sitemap_url', description: 'The URL of the sitemap to process')]
  #[CLI\Option(name: 'timeout', description: 'HTTP request timeout in seconds', suggestedValues: [30, 60, 120])]
  #[CLI\Option(name: 'limit', description: 'Limit the number of URLs to process')]
  #[CLI\Option(name: 'dry-run', description: 'Run without making changes')]
  #[CLI\Usage(name: 'drush sitemap:process https://example.com/sitemap.xml', description: 'Process a sitemap')]
  #[CLI\Usage(name: 'drush sp https://example.com/sitemap.xml --limit=10', description: 'Process only first 10 URLs')]
  #[CLI\Usage(name: 'drush sp https://example.com/sitemap.xml --dry-run', description: 'Preview what would be processed')]
  public function processSitemap(string $sitemap_url, array $options = [
    'timeout' => 30,
    'limit' => NULL,
    'dry-run' => FALSE,
  ]): void {
    $logger = $this->loggerFactory->get('sitemap_processor');

    // Validate the sitemap URL
    if (!filter_var($sitemap_url, FILTER_VALIDATE_URL)) {
      $this->logger()->error('Invalid sitemap URL provided: ' . $sitemap_url);
      return;
    }

    $this->logger()->info('Starting sitemap processing for: ' . $sitemap_url);

    if ($options['dry-run']) {
      $this->logger()->notice('DRY RUN MODE - No changes will be made');
    }

    try {
      // Fetch the sitemap
      $sitemap_data = $this->fetchSitemap($sitemap_url, (int) $options['timeout']);

      if (!$sitemap_data) {
        $this->logger()->error('Failed to fetch sitemap data');
        return;
      }

      // Parse the sitemap
      $urls = $this->parseSitemap($sitemap_data);

      if (empty($urls)) {
        $this->logger()->warning('No URLs found in sitemap');
        return;
      }

      $total_urls = count($urls);
      $this->logger()->info("Found {$total_urls} URLs in sitemap");

      // Apply limit if specified
      if ($options['limit'] && is_numeric($options['limit'])) {
        $limit = (int) $options['limit'];
        $urls = array_slice($urls, 0, $limit);
        $this->logger()->info("Processing limited to {$limit} URLs");
      }

      // Process each URL
      $this->processUrls($urls, $options);
    } catch (\Exception $e) {
      $this->logger()->error('Error processing sitemap: ' . $e->getMessage());
      $logger->error('Sitemap processing error', ['exception' => $e]);
    }
  }

  /**
   * Fetch sitemap data from URL.
   *
   * @param string $url
   *   The sitemap URL.
   * @param int $timeout
   *   Request timeout in seconds.
   *
   * @return string|null
   *   The sitemap XML data or NULL on failure.
   */
  protected function fetchSitemap(string $url, int $timeout = 30): ?string {
    try {
      $this->logger()->info('Fetching sitemap from: ' . $url);

      $response = $this->httpClient->request('GET', $url, [
        'timeout' => $timeout,
        'headers' => [
          'User-Agent' => 'Drupal Sitemap Processor/1.0',
        ],
      ]);

      if ($response->getStatusCode() === 200) {
        return $response->getBody()->getContents();
      }

      $this->logger()->error('HTTP error: ' . $response->getStatusCode());
      return NULL;
    } catch (RequestException $e) {
      $this->logger()->error('Failed to fetch sitemap: ' . $e->getMessage());
      return NULL;
    }
  }

  /**
   * Parse sitemap XML and extract URLs.
   *
   * @param string $xml_data
   *   The sitemap XML data.
   *
   * @return array
   *   Array of URL data with loc, lastmod, changefreq, priority.
   */
  protected function parseSitemap(string $xml_data): array {
    $urls = [];

    try {
      // Handle gzipped content
      if (substr($xml_data, 0, 2) === "\x1f\x8b") {
        $xml_data = gzinflate(substr($xml_data, 10, -8));
      }

      $xml = new \SimpleXMLElement($xml_data);

      // Check if this is a sitemap index
      if (isset($xml->sitemap)) {
        $this->logger()->info('Detected sitemap index, processing sub-sitemaps');
        return $this->processSitemapIndex($xml);
      }

      // Process regular sitemap
      foreach ($xml->url as $url_element) {
        $url_data = [
          'loc' => (string) $url_element->loc,
          'lastmod' => isset($url_element->lastmod) ? (string) $url_element->lastmod : NULL,
          'changefreq' => isset($url_element->changefreq) ? (string) $url_element->changefreq : NULL,
          'priority' => isset($url_element->priority) ? (float) $url_element->priority : NULL,
        ];

        $urls[] = $url_data;
      }
    } catch (\Exception $e) {
      $this->logger()->error('Failed to parse sitemap XML: ' . $e->getMessage());
    }

    return $urls;
  }

  /**
   * Process sitemap index and fetch all sub-sitemaps.
   *
   * @param \SimpleXMLElement $xml
   *   The sitemap index XML.
   *
   * @return array
   *   Combined URLs from all sub-sitemaps.
   */
  protected function processSitemapIndex(\SimpleXMLElement $xml): array {
    $all_urls = [];

    foreach ($xml->sitemap as $sitemap_element) {
      $sitemap_url = (string) $sitemap_element->loc;
      $this->logger()->info('Processing sub-sitemap: ' . $sitemap_url);

      $sitemap_data = $this->fetchSitemap($sitemap_url);
      if ($sitemap_data) {
        $urls = $this->parseSitemap($sitemap_data);
        $all_urls = array_merge($all_urls, $urls);
        $this->logger()->info('Added ' . count($urls) . ' URLs from sub-sitemap');
      }
    }

    return $all_urls;
  }

  /**
   * Process individual URLs from the sitemap.
   *
   * @param array $urls
   *   Array of URL data.
   * @param array $options
   *   Command options.
   */
  protected function processUrls(array $urls, array $options): void {
    $total = count($urls);
    $processed = 0;

    $this->logger()->info("Starting to process {$total} URLs");

    foreach ($urls as $url_data) {
      $processed++;

      // Log progress every 10 items or for small batches
      if ($processed % 10 === 0 || $total < 50) {
        $this->logger()->info("Processing URL {$processed}/{$total}: {$url_data['loc']}");
      }

      // This is where you'll add your custom processing logic
      $this->processIndividualUrl($url_data, $options);
    }

    $this->logger()->success("Completed processing {$processed} URLs");
  }

  /**
   * Process an individual URL from the sitemap.
   *
   * @param array $url_data
   *   URL data array with loc, lastmod, changefreq, priority.
   * @param array $options
   *   Command options.
   */
  protected function processIndividualUrl(array $url_data, array $options): void {
    // TODO: Add your custom processing logic here
    // Examples of what you might do:
    // - Validate the URL is accessible
    // - Extract content from the page
    // - Update Drupal entities
    // - Generate reports
    // - Cache warming

    if ($options['dry-run']) {
      $this->logger()->info("DRY RUN: Would process URL: {$url_data['loc']}");
      return;
    }

    // Placeholder for actual processing
    // Remove this when you add real functionality
    $this->output()->writeln("Processing: {$url_data['loc']}");

    $existing = \Drupal::entityTypeManager()->getStorage('external_page')->loadByProperties([
      'label' => hash('md5', $url_data['loc']),
    ]);

    if (empty($existing)) {
      $node = ExternalPage::create([
        'type' => 'external_page',
        'label' => hash('md5', $url_data['loc']),
        'url' => $url_data['loc'],
      ]);
      $node->save();
      $this->output()->writeln("Created : {$node->label()}");
      $item = new \stdClass();
      $item->entity = $node;
      $queue = \Drupal::service('queue')->get('embeddings_queue');
      $queue->createItem($item);
    } else {
      $this->output()->writeln("External page exists");
    }

    // $fetcher = \Drupal::service('chat_ai.content_fetcher');
    // $content = $fetcher->fetchUrl($url_data['loc']);
    // $node->set('body', $content);
    // $node->save();
    // @todo Insert to queue
  }
}
