<?php

namespace Drupal\silverback_search\Plugin\search_api\processor\Property;

use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\search_api\Item\FieldInterface;
use Drupal\search_api\Processor\ConfigurablePropertyBase;

class RemoteRenderedItemProperty extends ConfigurablePropertyBase {

  use StringTranslationTrait;

  public function defaultConfiguration() {
    return [
      'root_selector' => '#main-content',
      'exclude_selector' => '',
      'netlify_password' => '',
      'entity_types' => [],
    ];
  }

  public function buildConfigurationForm(FieldInterface $field, array $form, FormStateInterface $form_state) {
    $config = $field->getConfiguration() + $this->defaultConfiguration();

    $form['root_selector'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Root CSS Selector'),
      '#description' => $this->t('CSS selector to define the root of the indexed content (e.g. "#main-content" to exclude menus)'),
      '#default_value' => $config['root_selector'],
      '#required' => TRUE,
    ];

    $form['exclude_selector'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Exclude CSS Selector'),
      '#description' => $this->t('CSS selector to exclude specific elements from the indexed content (e.g. ".page-actions, #main-content > .pre-footer")'),
      '#default_value' => $config['exclude_selector'],
      '#required' => FALSE,
    ];

    $form['netlify_password'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Netlify Password'),
      '#description' => $this->t('Password for Netlify password protection'),
      '#default_value' => $config['netlify_password'],
      '#required' => FALSE,
    ];

    $entity_types = \Drupal::entityTypeManager()->getDefinitions();
    $content_entity_types = [];
    foreach ($entity_types as $entity_type_id => $entity_type) {
      if ($entity_type->entityClassImplements(ContentEntityInterface::class)) {
        $content_entity_types[$entity_type_id] = $entity_type->getLabel();
      }
    }
    $form['entity_types'] = [
      '#type' => 'checkboxes',
      '#title' => $this->t('Entity Types'),
      '#description' => $this->t('Select which entity types should be processed.'),
      '#options' => $content_entity_types,
      '#default_value' => $config['entity_types'],
    ];

    return $form;
  }

} 
