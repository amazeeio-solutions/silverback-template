<?php

namespace Drupal\remote_page;

use Drupal\Core\Entity\ContentEntityTypeInterface;
use Drupal\Core\Entity\Sql\SqlContentEntityStorageSchema;

class RemotePageStorageSchema extends SqlContentEntityStorageSchema {

  protected function getEntitySchema(ContentEntityTypeInterface $entity_type, $reset = FALSE) {
    $schema = parent::getEntitySchema($entity_type, $reset);

    if ($data_table = $this->storage->getDataTable()) {
      $schema[$data_table]['indexes'] += [
        'remote_page__url' => ['url'],
        'remote_page__hash' => ['hash'],
      ];
    }

    return $schema;
  }
}
