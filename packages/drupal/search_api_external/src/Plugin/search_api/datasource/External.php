<?php

namespace Drupal\search_api_external\Plugin\search_api\datasource;

use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Plugin\PluginFormInterface;
use Drupal\Core\TypedData\ComplexDataInterface;
use Drupal\Core\TypedData\Plugin\DataType\Map;
use Drupal\search_api\Datasource\DatasourcePluginBase;

/**
 * Represents a datasource which exposes the content entities.
 *
 * @SearchApiDatasource(
 *   id = "external",
 *   label = @Translation("External website(s)"),
 *   description = @Translation("Uses external websites (their xmlsitemaps) as a datasource."),
 * )
 */
class External extends DatasourcePluginBase implements PluginFormInterface {

  /**
   * @inheritdoc
   */
  public function getItemId(ComplexDataInterface $item) {
    return $item->id();
  }

  public function getItemIds($page = NULL) {
    // @todo: implement pagination (basically one page would be one xmlsitemap)
    if ($page > 0) {
      return NULL;
    }
    $urls = explode("\n", $this->configuration['xmlsitemap_urls']);
    foreach ($urls as $url) {
      $url = trim($url);
      if (empty($url)) {
        continue;
      }
      $xmlContent = file_get_contents($url);
      $xml = simplexml_load_string($xmlContent);
      $index = 1;
      foreach ($xml->url as $url) {
        // Temporary limit to 10 items.
        if ($index > 10) {
          break;
        }
        $itemIds[] = $url->loc;
        $index++;
      }
    }
    return $itemIds;
  }

  /**
   * @inheritdoc
   */
  public function buildConfigurationForm(array $form, FormStateInterface $form_state) {
    $form['xmlsitemap_urls'] = [
      '#type' => 'textarea',
      '#title' => $this->t('XML Sitemap URLs'),
      '#description' => $this->t('Enter the URLs (xml sitemaps) of the external websites you want to index, one per line.'),
      '#default_value' => $this->configuration['xmlsitemap_urls'],
      '#required' => TRUE,
    ];
    return $form;
  }

  /**
   * @inheritdoc
   */
  public function submitConfigurationForm(array &$form, FormStateInterface $form_state) {
    $this->configuration['xmlsitemap_urls'] = $form_state->getValue('xmlsitemap_urls');
    // Make sure not to overwrite any options not included in the form (like
    // "disable_db_tracking") by adding any existing configuration back to the
    // new values.
    $this->setConfiguration($form_state->getValues() + $this->configuration);
  }

  /**
   * @inheritdoc
   */
  public function validateConfigurationForm(array &$form, FormStateInterface $form_state) {
    return;
  }

  public function loadMultiple(array $ids) {
    $entities = [];
    $definition = \Drupal::typedDataManager()->createDataDefinition('external_web_page');
    foreach ($ids as $id) {
      $uri = new Map($definition);
      $uri->set('value', $id);
      $entities[$id] = $uri;
    }
    return $entities;
  }
}
