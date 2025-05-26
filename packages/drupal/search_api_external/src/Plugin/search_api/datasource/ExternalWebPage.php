<?php

namespace Drupal\search_api_external\Plugin\search_api\datasource;

use Drupal\Core\Form\FormStateInterface;
use Drupal\search_api\Plugin\search_api\datasource\ContentEntity;
class ExternalWebPage extends ContentEntity {
  /**
   * @inheritdoc
   */
  public function buildConfigurationForm(array $form, FormStateInterface $form_state) {
    $form['xmlsitemap_urls'] = [
      '#type' => 'textarea',
      '#title' => $this->t('XML Sitemap URL'),
      '#description' => $this->t('Enter the URL (xml sitemaps) of the external website that you want to index.'),
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
}
