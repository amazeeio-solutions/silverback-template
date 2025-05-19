<?php

namespace Drupal\silverback_iframe\Plugin\WebformSourceEntity;

use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Form\FormStateInterface;
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
   * {@inheritdoc}
   */
  public function getSourceEntity(array $ignored_types) {
    // Try the default implementation first
    $source_entity = parent::getSourceEntity($ignored_types);
    if ($source_entity !== NULL) {
      return $source_entity;
    }

    // Ensure we have a valid webform
    $webform = $this->routeMatch->getParameter('webform');
    if (!$webform instanceof WebformInterface) {
      return $source_entity;
    }

    // Skip our custom logic if the webform already has prepopulation enabled
    if ($webform->getSetting('form_prepopulate_source_entity')) {
      return $source_entity;
    }

    // Only proceed with custom logic if we're in iframe mode
    if (!silverback_iframe_theme_enabled()) {
      return NULL;
    }


    // Check for preserved source entity ID from form submission
    if ($this->request->request->get('silverback_iframe_source_entity_id')) {
      $node_id = $this->request->request->get('silverback_iframe_source_entity_id');
      $node = $this->entityTypeManager->getStorage('node')->load($node_id);
      if ($node instanceof EntityInterface) {
        return $node;
      }
    }

    // Check for ref parameter and decode it
    $referrer = NULL;
    if ($this->request->query->has('ref')) {
      $encoded_url = $this->request->query->get('ref');
      try {
        $decoded_url = base64_decode($encoded_url);
        if ($decoded_url !== FALSE) {
          $referrer = urldecode($decoded_url);
        }
      } catch (\Exception $e) {
        // Log the error but continue with the normal referrer
        \Drupal::logger('silverback_iframe')->warning('Failed to decode ref parameter: @error', ['@error' => $e->getMessage()]);
      }
    }

    // If no ref parameter or decoding failed, fall back to HTTP referer
    if (empty($referrer)) {
      $referrer = $this->request->headers->get('referer');
      if (empty($referrer)) {
        return NULL;
      }
    }

    // Parse the referrer URL to extract path
    $referrer_parts = parse_url($referrer);
    if (!isset($referrer_parts['path'])) {
      return NULL;
    }

    // Validate path and check if it's a node page
    $path = $referrer_parts['path'];
    $url = \Drupal::service('path.validator')->getUrlIfValid($path);

    if (!$url || $url->getRouteName() !== 'entity.node.canonical') {
      return NULL;
    }

    // Extract and load the node from route parameters
    $route_parameters = $url->getRouteParameters();
    if (!isset($route_parameters['node'])) {
      return NULL;
    }

    $node = $this->entityTypeManager->getStorage('node')->load($route_parameters['node']);
    if (!$node instanceof EntityInterface) {
      return NULL;
    }

    // Return the node as our source entity
    return $node;
  }
}
