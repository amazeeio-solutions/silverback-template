<?php

namespace Drupal\silverback_search\Service;

use Drupal\Core\Database\Connection;
use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\silverback_external_preview\ExternalPreviewLink;
use Drupal\silverback_search\FetchResult;
use GuzzleHttp\Client;
use GuzzleHttp\Cookie\CookieJar;
use GuzzleHttp\Exception\GuzzleException;
use GuzzleHttp\Exception\RequestException;
use GuzzleHttp\Psr7\Request;
use GuzzleHttp\RequestOptions;
use GuzzleHttp\TransferStats;
use Psr\Http\Message\ResponseInterface;
use Psr\Log\LoggerInterface;

/**
 * Service for fetching content from remote frontend.
 */
class RemoteFrontend {

  /**
   * The external preview link service.
   */
  protected ExternalPreviewLink $externalPreviewLink;

  /**
   * The logger service.
   */
  protected LoggerInterface $logger;

  /**
   * The database connection.
   */
  protected Connection $database;

  /**
   * The HTTP client.
   */
  protected Client $httpClient;

  /**
   * The module handler service.
   */
  protected ModuleHandlerInterface $moduleHandler;

  /**
   * The Netlify password for authentication.
   */
  protected ?string $netlifyPassword = NULL;

  /**
   * Cached build ID.
   */
  private ?int $cachedBuildId = NULL;

  public function __construct(
    ExternalPreviewLink $external_preview_link,
    LoggerChannelFactoryInterface $logger_factory,
    Connection $database,
    ModuleHandlerInterface $module_handler,
  ) {
    $this->externalPreviewLink = $external_preview_link;
    $this->logger = $logger_factory->get('silverback_search');
    $this->database = $database;
    $this->moduleHandler = $module_handler;
    $this->httpClient = new Client([
      RequestOptions::HTTP_ERRORS => FALSE,
      RequestOptions::COOKIES => new CookieJar(),
      RequestOptions::TIMEOUT => 5,
    ]);
  }

  /**
   * Must be called before any other method.
   */
  public function setNetlifyPassword(?string $netlifyPassword): void {
    $this->netlifyPassword = $netlifyPassword ?? '';
  }

  /**
   * Gets the HTML of the entity from the remote frontend.
   */
  public function getEntityHtml(ContentEntityInterface $entity): FetchResult {
    $this->checkNetlifyPassword();
    $liveUrl = $this->externalPreviewLink->createPreviewUrlFromEntity($entity, 'live')?->toString();
    if (!$liveUrl) {
      return new FetchResult(
        NULL,
        'Could not get live URL for entity ' . $entity->getEntityTypeId() . ':' . $entity->id(),
        $liveUrl,
        NULL,
      );
    }
    $liveUrlOriginal = $liveUrl;
    $this->moduleHandler->alter('silverback_search_live_url', $liveUrl, $entity);
    if ($liveUrl === 'skip') {
      return new FetchResult('', NULL, $liveUrlOriginal, NULL, TRUE);
    }
    return $this->getFromRemote($liveUrl);
  }

  /**
   * Checks if the entity is outdated on the remote frontend.
   */
  public function isOutdated(ContentEntityInterface $entity): bool {
    $this->checkNetlifyPassword();
    $buildId = $this->getBuildId();
    if (!$buildId) {
      return FALSE;
    }
    $count = $this->getUpdateCount($entity->uuid(), $buildId);
    return $count > 0;
  }

  /**
   * Fetches content from a remote URL.
   *
   * @param string $url
   *   The URL to fetch from.
   *
   * @return \Drupal\silverback_search\FetchResult
   *   The fetch result.
   */
  private function getFromRemote(string $url): FetchResult {
    try {
      $response = $this->makeRequest('GET', $url);
      if ($response->getStatusCode() === 401) {
        if ($this->netlifyPassword) {
          $response = $this->makeRequest('POST', $url, [
            RequestOptions::FORM_PARAMS => [
              'password' => $this->netlifyPassword,
            ],
          ]);
          if ($response->getStatusCode() === 401) {
            return new FetchResult(
              NULL,
              'Could not fetch from remote because Netlify password is incorrect.',
              $url,
              $response->getStatusCode(),
            );
          }
        }
        else {
          return new FetchResult(
            NULL,
            'Could not fetch from remote because Netlify password is not set.',
            $url,
            $response->getStatusCode(),
          );
        }
      }
      if ($response->getStatusCode() !== 200) {
        return new FetchResult(
          NULL,
          'Could not fetch from remote because the response status code is ' . $response->getStatusCode() . '.',
          $url,
          $response->getStatusCode(),
        );
      }
      return new FetchResult(
        $response->getBody()->getContents(),
        NULL,
        $url,
        $response->getStatusCode(),
      );
    }
    catch (GuzzleException $e) {
      if ($e->getMessage() === 'Host changed after redirect') {
        return new FetchResult('', NULL, $url, NULL, TRUE);
      }
      return new FetchResult(
        NULL,
        'Could not fetch from remote: ' . $e->getMessage(),
        $url,
        NULL,
      );
    }
  }

  /**
   * Makes an HTTP request.
   *
   * @param string $method
   *   The HTTP method.
   * @param string $url
   *   The URL to request.
   * @param array $options
   *   Additional request options.
   *
   * @return \Psr\Http\Message\ResponseInterface
   *   The HTTP response.
   */
  private function makeRequest(string $method, string $url, array $options = []): ResponseInterface {
    $originalHost = parse_url($url, PHP_URL_HOST);
    $effectiveUrl = NULL;

    $options[RequestOptions::ON_STATS] = function (TransferStats $stats) use (&$effectiveUrl) {
      $effectiveUrl = $stats->getEffectiveUri()->__toString();
    };

    $response = $this->httpClient->request($method, $url, $options);

    // Make sure we don't fetch from an external host.
    if ($effectiveUrl) {
      $effectiveHost = parse_url($effectiveUrl, PHP_URL_HOST);
      $normalizedOriginal = preg_replace('/^www\./i', '', $originalHost);
      $normalizedEffective = preg_replace('/^www\./i', '', $effectiveHost);
      if ($normalizedOriginal !== $normalizedEffective) {
        throw new RequestException('Host changed after redirect', new Request($method, $url));
      }
    }

    return $response;
  }

  /**
   * Gets the update count for an entity.
   *
   * @param string $entityUuid
   *   The entity UUID.
   * @param int $buildId
   *   The build ID.
   *
   * @return int
   *   The update count.
   */
  private function getUpdateCount(string $entityUuid, int $buildId): int {
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

  /**
   * Gets the current build ID.
   *
   * @return int|null
   *   The build ID or NULL if not available.
   */
  private function getBuildId(): ?int {
    if ($this->cachedBuildId !== NULL) {
      return $this->cachedBuildId;
    }
    try {
      $buildJsonUrl = $this->externalPreviewLink->getLiveBaseUrl() . '/build.json';
      $result = $this->getFromRemote($buildJsonUrl);
      if ($result->error) {
        $this->logger->error('Could not get build ID: {error}. URL: {url}', [
          'error' => $result->error,
          'url' => $buildJsonUrl,
        ]);
        return NULL;
      }
      $buildInfo = json_decode($result->content, TRUE);
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

  /**
   * Checks if Netlify password is set.
   *
   * @throws \Exception
   *   If the password is not set.
   */
  private function checkNetlifyPassword(): void {
    if ($this->netlifyPassword === NULL) {
      throw new \Exception('Netlify password is not set. Use setNetlifyPassword() first.');
    }
  }

}
