<?php

declare(strict_types=1);

namespace Drupal\silverback_search;

use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\entity_usage\EntityUsageInterface;

/**
 * @todo Add class description.
 */
final class SearchApiIndexUpdate {

  /**
   * Constructs a SearchApiIndexUpdate object.
   */
  public function __construct(
    private readonly EntityUsageInterface $entityUsageUsage,
    private readonly EntityTypeManagerInterface $entityTypeManager,
  ) {
  }

  /**
   * Updates the Search API index for all source entities using the given entity.
   *
   * Checks if the Search API module is enabled. If so, retrieves all usages
   * of the provided entity, loads each source entity, and triggers a Search API
   * entity update for each one. Skips any source entities that cannot be loaded.
   *
   * @param \Drupal\Core\Entity\EntityInterface $entity
   *   The entity whose usages should trigger Search API index updates.
   */
  public function searchApiIndexUpdate(EntityInterface $entity): void {

    if (!\Drupal::moduleHandler()->moduleExists('search_api')) {
      return;
    }

    $all_usages = \Drupal::service('entity_usage.usage')->listSources($entity);
    foreach ($all_usages as $source_type => $ids) {
      $type_storage = \Drupal::service('entity_type.manager')->getStorage($source_type);
      foreach ($ids as $source_id => $records) {
        $source_entity = $type_storage->load($source_id);
        if (!$source_entity) {
          // If for some reason this record is broken, just skip it.
          continue;
        }
        search_api_entity_update($source_entity);
      }
    }
  }
}
