<?php

namespace Drupal\silverback_iframe\Plugin\WebformSourceEntity;

use Drupal\Core\Entity\EntityInterface;
use Drupal\webform\Plugin\WebformSourceEntity\QueryStringWebformSourceEntity as Original;
use Drupal\webform\WebformInterface;

/**
 * Custom implementation of query string source entity detection.
 *
 * @WebformSourceEntity(
 *   id = "silverback_iframe_query_string",
 *   label = @Translation("Silverback iFrame Query String"),
 *   weight = 100
 * )
 */
class QueryStringWebformSourceEntity extends Original {

  /**
   * Flag to enable debug logging.
   *
   * @var bool
   */
  private bool $debugEnabled = FALSE;

  /**
   * {@inheritdoc}
   */
  public function getSourceEntity(array $ignored_types) {
    // Enable debug logging based on query parameter.
    $this->debugEnabled = $this->request->query->get('debug', 'false') === 'true';

    $this->debugLog('Starting source entity detection with ignored types: @types', ['@types' => implode(', ', $ignored_types)], 'step');

    // Try the default implementation first.
    $this->debugLog('Trying parent implementation first', [], 'step');
    $source_entity = parent::getSourceEntity($ignored_types);
    if ($source_entity !== NULL) {
      $this->debugLog('Parent implementation returned source entity: @type #@id', [
        '@type' => $source_entity->getEntityTypeId(),
        '@id' => $source_entity->id(),
      ], 'success');
      return $source_entity;
    }
    $this->debugLog('Parent implementation returned NULL, continuing with custom logic', [], 'neutral');

    // Ensure we have a valid webform.
    $webform = $this->routeMatch->getParameter('webform');
    $this->debugLog('Route webform parameter: @webform', [
      '@webform' => $webform instanceof WebformInterface ? $webform->id() : 'NULL',
    ], 'check');

    if (!$webform instanceof WebformInterface) {
      $this->debugLog('No valid webform found in route, checking for fallback methods.', [], 'warning');

      $silverback_iframe_webform_id = $this->request->attributes->get('silverback_iframe_webform_id');
      if (!$silverback_iframe_webform_id) {
        $this->debugLog('No webform ID found in request attributes, exiting', [], 'error');
        return $source_entity;
      }

      $this->debugLog('Using fallback webform ID from request attributes: @id', ['@id' => $silverback_iframe_webform_id]);
      $webform = $this->entityTypeManager->getStorage('webform')->load($silverback_iframe_webform_id);

      if (!$webform instanceof WebformInterface) {
        $this->debugLog('Failed to load webform with ID: @id', ['@id' => $silverback_iframe_webform_id], 'error');
        return $source_entity;
      }
    }

    // Skip our custom logic if the webform already has prepopulation enabled.
    $prepopulation_enabled = $webform->getSetting('form_prepopulate_source_entity');
    $this->debugLog('Webform prepopulation setting: @setting', ['@setting' => $prepopulation_enabled ? 'enabled' : 'disabled'], 'check');

    if ($prepopulation_enabled) {
      $this->debugLog('Webform has prepopulation enabled, skipping custom logic', [], 'info');
      return $source_entity;
    }

    // Only proceed with custom logic if we're in iframe mode.
    $iframe_enabled = silverback_iframe_theme_enabled();
    $this->debugLog('Silverback iframe theme enabled: @enabled', ['@enabled' => $iframe_enabled ? 'yes' : 'no'], 'check');

    if (!$iframe_enabled) {
      $this->debugLog('Not in iframe mode, exiting', [], 'warning');
      return NULL;
    }

    // Check for preserved source entity ID from form submission.
    $preserved_id = $this->request->request->get('silverback_iframe_source_entity_id');
    $this->debugLog('Checking for preserved source entity ID: @id', ['@id' => $preserved_id ?: 'not found'], 'check');

    if ($preserved_id) {
      $node = $this->entityTypeManager->getStorage('node')->load($preserved_id);
      $this->debugLog('Loading node from preserved ID: @result', ['@result' => $node ? 'success' : 'failed'], $node ? 'success' : 'warning');

      if ($node instanceof EntityInterface) {
        $this->debugLog('Returning node from preserved ID: node/@id', ['@id' => $node->id()], 'success');
        return $node;
      }
    }

    // Check for ref parameter and decode it.
    $referrer = NULL;
    $ref_param = $this->request->query->get('ref');
    $this->debugLog('Checking ref parameter: @ref', ['@ref' => $ref_param ?: 'not found'], 'check');

    if ($this->request->query->has('ref')) {
      $encoded_url = $this->request->query->get('ref');
      $this->debugLog('Found ref parameter: @value', ['@value' => $encoded_url], 'info');

      $decoded_url = base64_decode($encoded_url, TRUE);
      if ($decoded_url === FALSE) {
        $this->debugLog('Failed to base64 decode ref parameter', [
          '@value' => $encoded_url,
          '@query_string' => $this->request->getQueryString(),
          '@all_params' => print_r($this->request->query->all(), TRUE),
        ], 'error');
        \Drupal::logger('silverback_iframe')->warning('Failed to base64 decode ref parameter: @value', ['@value' => $encoded_url]);
      }
      else {
        $this->debugLog('Successfully base64 decoded: @decoded', ['@decoded' => $decoded_url], 'success');
        $referrer = urldecode($decoded_url);
        $this->debugLog('URL decoded result: @referrer', ['@referrer' => $referrer], 'info');

        // If urldecode did not change the string, it may not have been encoded.
        if ($referrer === $decoded_url && preg_match('/%[0-9A-Fa-f]{2}/', $decoded_url)) {
          $this->debugLog('URL decoding issue - raw bytes: @bytes', ['@bytes' => bin2hex($decoded_url)], 'warning');
          \Drupal::logger('silverback_iframe')->warning('Failed to urldecode ref parameter: @value', ['@value' => $decoded_url]);
        }
      }
    }

    // If no ref parameter or decoding failed, fall back to HTTP referer.
    if (empty($referrer)) {
      $http_referrer = $this->request->headers->get('referer');
      $this->debugLog('No valid ref param, falling back to HTTP referer: @referer', ['@referer' => $http_referrer ?: 'not found'], 'step');

      $referrer = $http_referrer;
      if (empty($referrer)) {
        $this->debugLog('No referrer available, exiting', [], 'warning');
        return NULL;
      }
    }

    // Parse the referrer URL to extract path.
    $this->debugLog('Parsing referrer URL: @url', ['@url' => $referrer], 'step');
    $referrer_parts = parse_url($referrer);
    $this->debugLog('Parsed URL parts: @parts', ['@parts' => print_r($referrer_parts, TRUE)], 'info');

    if (!isset($referrer_parts['path'])) {
      $this->debugLog('No path component in referrer URL, exiting', [], 'warning');
      return NULL;
    }

    // Validate path and check if it's a node page.
    $path = $referrer_parts['path'];
    $this->debugLog('Validating path: @path', ['@path' => $path], 'check');
    $url = \Drupal::service('path.validator')->getUrlIfValid($path);

    if (!$url) {
      $this->debugLog('Path validation failed, path is not valid', [], 'error');
      return NULL;
    }

    $route_name = $url->getRouteName();
    $this->debugLog('Path resolved to route: @route', ['@route' => $route_name], 'info');

    if ($route_name !== 'entity.node.canonical') {
      $this->debugLog('Route is not a node canonical route, exiting', [], 'warning');
      return NULL;
    }

    // Extract and load the node from route parameters.
    $route_parameters = $url->getRouteParameters();
    $this->debugLog('Route parameters: @params', ['@params' => print_r($route_parameters, TRUE)], 'info');

    if (!isset($route_parameters['node'])) {
      $this->debugLog('No node parameter in route, exiting', [], 'warning');
      return NULL;
    }

    $node_id = $route_parameters['node'];
    $this->debugLog('Attempting to load node: @id', ['@id' => $node_id], 'step');
    $node = $this->entityTypeManager->getStorage('node')->load($node_id);

    if (!$node instanceof EntityInterface) {
      $this->debugLog('Failed to load node entity, exiting', [], 'error');
      return NULL;
    }

    // Return the node as our source entity.
    $this->debugLog('Successfully resolved source entity: node/@id (@type)', [
      '@id' => $node->id(),
      '@type' => $node->bundle(),
    ], 'success');
    return $node;
  }

  /**
   * Private helper method to log debug information with status emojis.
   *
   * @param string $message
   *   Debug message.
   * @param array $context
   *   Context data to include in the log.
   * @param string $status
   *   Status of the message. Expected values include: 'success', 'error', 'warning', 'neutral', 'step', 'check', or 'info' (default).
   */
  private function debugLog(string $message, array $context = [], string $status = 'info'): void {
    if ($this->debugEnabled) {
      $emoji = match ($status) {
        'success' => '✅ ',
        'error' => '❌ ',
        'warning' => '⚠️ ',
        'neutral' => '🔍 ',
        'step' => '➡️ ',
        'check' => '🔎 ',
        // Info is the default.
        default => 'ℹ️ ',
      };

      \Drupal::logger('silverback_iframe')->debug($emoji . $message, $context);
    }
  }

}
