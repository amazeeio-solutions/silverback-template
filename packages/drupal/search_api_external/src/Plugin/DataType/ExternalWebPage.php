<?php

namespace Drupal\search_api_external\Plugin\DataType;

use Drupal\Core\StringTranslation\TranslatableMarkup;
use Drupal\Core\TypedData\Plugin\DataType\Map;
use Drupal\Core\TypedData\Attribute\DataType;
use Drupal\search_api_external\ExternalWebPageDataDefinition;

/**
 * The external_web_page data type.
 */
#[DataType(
  id: "external_web_page",
  label: new TranslatableMarkup("External Web Page"),
  definition_class: ExternalWebPageDataDefinition::class,
)]
class ExternalWebPage extends Map {
}
