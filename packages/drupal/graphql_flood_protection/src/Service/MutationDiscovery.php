<?php

namespace Drupal\graphql_flood_protection\Service;

use Drupal\Core\Entity\EntityTypeManagerInterface;

/**
 * Service for discovering GraphQL mutations from a server schema.
 */
class MutationDiscovery {

  /**
   * Constructs a new MutationDiscovery service.
   *
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entityTypeManager
   *   The entity type manager.
   */
  public function __construct(
    private readonly EntityTypeManagerInterface $entityTypeManager,
  ) {}

  /**
   * Gets all mutations for a given GraphQL server.
   *
   * @param string $serverId
   *   The server ID.
   *
   * @return array
   *   An associative array of mutation names keyed by name.
   */
  public function getMutationsForServer(string $serverId): array {
    if (empty($serverId)) {
      return [];
    }

    // Load server entity.
    $server = $this->entityTypeManager
      ->getStorage('graphql_server')
      ->load($serverId);

    if (!$server) {
      return [];
    }

    try {
      // Get schema from server configuration.
      $schema = $server->configuration()->getSchema();

      if (!$schema) {
        return [];
      }

      // Get mutation type and extract field names.
      $mutationType = $schema->getMutationType();
      if (!$mutationType) {
        return [];
      }

      $mutations = [];
      foreach ($mutationType->getFields() as $field) {
        $mutations[$field->getName()] = $field->getName();
      }

      return $mutations;
    }
    catch (\Exception $e) {
      // Log error but don't break the form.
      \Drupal::logger('graphql_flood_protection')->error('Failed to load mutations from server @server: @message', [
        '@server' => $serverId,
        '@message' => $e->getMessage(),
      ]);
      return [];
    }
  }

}

