<?php

namespace Drupal\search_api_external\Plugin\search_api\processor;

use Drupal\search_api\Datasource\DatasourceInterface;
use Drupal\search_api\Item\ItemInterface;
use Drupal\search_api\Processor\ProcessorPluginBase;
use Drupal\search_api\Processor\ProcessorProperty;

/**
 * @SearchApiProcessor(
 *   id = "external_web_page",
 *   label = @Translation("External Web Page"),
 *   description = @Translation("Field containing the external web page HTML output."),
 *   stages = {
 *     "add_properties" = 0,
 *   },
 *   locked = true,
 *   hidden = true,
 * )
 */
class ExternalWebPage extends ProcessorPluginBase {
  public function __construct(array $configuration, $plugin_id, $plugin_definition) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
  }

  public function getPropertyDefinitions(DatasourceInterface $datasource = NULL) {
    $properties = [];

    if (!$datasource) {
      $definition = [
        'label' => $this->t('External web page HTML output'),
        'description' => $this->t('The complete HTML fetched from a remote web page'),
        'type' => 'search_api_html',
        'processor_id' => $this->getPluginId(),
      ];
      $properties['external_web_page_html'] = new ProcessorProperty($definition);
    }

    return $properties;
  }

  public function addFieldValues(ItemInterface $item) {
    $url = $item->getOriginalObject()->getValue();
    if (empty($url['value'])) {
      return;
    }
    $url = $url['value'];
    $fields = $item->getFields(FALSE);
    $fields = $this->getFieldsHelper()
      ->filterForPropertyPath($fields, NULL, 'external_web_page_html');
    foreach ($fields as $field) {
      $html = $this->fetchHtml($url);
      $field->addValue($html);
    }
  }

  private function fetchHtml(string $url): string {
    $client = \Drupal::httpClient();
    $response = $client->get($url);
    return $response->getBody()->getContents();
  }
}
