<?php

namespace Drupal\search_api_remote_page\Plugin\search_api\datasource;

use Drupal\Core\Form\FormStateInterface;
use Drupal\search_api\Plugin\search_api\datasource\ContentEntity;
class RemotePage extends ContentEntity {
  /**
   * @inheritdoc
   */
  public function buildConfigurationForm(array $form, FormStateInterface $form_state) {
    $form['xmlsitemap_urls'] = [
      '#type' => 'textarea',
      '#title' => $this->t('XML Sitemap URL'),
      '#description' => $this->t('Enter the URL (xml sitemaps) of the remote website that you want to index.'),
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
    // To simulate the behaviour when having multiple bunldes, we need to
    // extract the host from the xmlsitemap_urls and use it as the bundles
    // setting.
    $urls = explode("\n", $this->configuration['xmlsitemap_urls']);
    $hosts = [];
    foreach ($urls as $url) {
      $host = parse_url($url, PHP_URL_HOST);
      $host = str_replace('.', '_', $host);
      $hosts[$host] = $host;
    }
    $form_state->setValue(['bundles', 'selected'], $hosts);
    // In order to see the meaning of the 'default' flag, please refer to the
    // ContentEntity::getBundles() method (basically when default is set to
    // TRUE, this means "All except those selected", so we need to set it to
    // FALSE).
    $form_state->setValue(['bundles', 'default'], FALSE);

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

  /**
   * @inheritdoc
   */
  public function getEntityBundles() {
    // We do not have a fixed, static, number of bundles for the remote page
    // entities. We use instead the host property from these entities to
    // determine all the available bundles at runtime.
    $entity_type = $this->getEntityType();
    $select = $this->getDatabaseConnection()
      ->select($entity_type->getBaseTable(), 'base_table')
      ->fields('base_table', ['host'])
      ->distinct();
    $result = $select->execute()->fetchCol();

    $bundles = [];
    if (empty($result)) {
      return $bundles;
    }
    foreach ($result as $host) {
      $bundles[$host] = [
        'label' => $host,
      ];
    }
    return $bundles;
  }
}
