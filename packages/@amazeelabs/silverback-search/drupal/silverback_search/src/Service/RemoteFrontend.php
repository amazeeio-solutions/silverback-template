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
use GuzzleHttp\RequestOptions;
use Psr\Log\LoggerInterface;

class RemoteFrontend {

  protected ExternalPreviewLink $externalPreviewLink;
  protected LoggerInterface $logger;
  protected Connection $database;
  protected Client $httpClient;
  protected ModuleHandlerInterface $moduleHandler;
  
  protected ?string $netlifyPassword = NULL;
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
      );
    }
    $this->moduleHandler->alter('silverback_search_live_url', $liveUrl, $entity);
    if ($liveUrl === 'skip') {
      return new FetchResult('', NULL, TRUE);
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

  private function getFromRemote(string $url): FetchResult {
    try {
      $response = $this->httpClient->request('GET', $url);
      if ($response->getStatusCode() === 401) {
        if ($this->netlifyPassword) {
          $response = $this->httpClient->request('POST', $url, [
            RequestOptions::FORM_PARAMS => [
              'password' => $this->netlifyPassword,
            ],
          ]);
          if ($response->getStatusCode() === 401) {
            return new FetchResult(
              NULL,
              'Could not fetch from remote because Netlify password is incorrect.',
            );
          }
        }
        else {
          return new FetchResult(
            NULL,
            'Could not fetch from remote because Netlify password is not set.',
          );
        }
      }
      if ($response->getStatusCode() !== 200) {
        return new FetchResult(
          NULL,
          'Could not fetch from remote because the response status code is ' . $response->getStatusCode() . '.',
        );
      }
      return new FetchResult(
        $response->getBody()->getContents(),
        NULL,
      );
    }
    catch (GuzzleException $e) {
      return new FetchResult(
        NULL,
        'Could not fetch from remote: ' . $e->getMessage(),
      );
    }
  }

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

  private function checkNetlifyPassword(): void {
    if ($this->netlifyPassword === NULL) {
      throw new \Exception('Netlify password is not set. Use setNetlifyPassword() first.');
    }
  }

} 
