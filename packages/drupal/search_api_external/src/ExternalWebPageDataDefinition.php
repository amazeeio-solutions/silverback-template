<?php

namespace Drupal\search_api_external;

use Drupal\Core\TypedData\ComplexDataDefinitionBase;
use Drupal\Core\TypedData\DataDefinition;
class ExternalWebPageDataDefinition extends ComplexDataDefinitionBase {

  public function getPropertyDefinitions() {

    if (!isset($this->propertyDefinitions)) {
      $this->propertyDefinitions['url'] = DataDefinition::create('uri');
    }
    return $this->propertyDefinitions;
  }

}
