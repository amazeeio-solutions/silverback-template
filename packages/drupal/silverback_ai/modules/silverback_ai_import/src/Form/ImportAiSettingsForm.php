<?php

declare(strict_types=1);

namespace Drupal\silverback_ai_import\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Configure silverback_ai_import settings for this site.
 */
final class ImportAiSettingsForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId(): string {
    return 'silverback_ai_import_import_ai_settings';
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames(): array {
    return ['silverback_ai_import.settings'];
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {

    $form['credentials'] = [
      '#type' => 'details',
      '#title' => $this->t('Open AI model'),
      '#open' => TRUE,
    ];

    // @todo Make this dynamically
    $form['credentials']['ai_model'] = [
      '#type' => 'select',
      '#title' => $this->t('Model'),
      '#options' => [
        'gpt-4o-mini' => 'gpt-4o-mini',
        'gpt-4o-mini-2024-07-18' => 'gpt-4o-mini-2024-07-18',
      ],
      '#empty_option' => $this->t('- Select model -'),
      '#description' => $this->t('Leave empty to use the default <strong><em>gpt-4o-mini</em></strong> model.') . '<br />' .
        $this->t('<strong><a href="@href" target="_blank">Learn more</a></strong> about the models.', [
          '@href' => 'https://openai.com/index/gpt-4o-mini-advancing-cost-efficient-intelligence',
        ]),
    ];

    $form['general'] = [
      '#type' => 'details',
      '#title' => $this->t('General settings'),
      '#open' => TRUE,
    ];

    $form['general']['converter_service_url'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Converter URL service'),
      '#default_value' => $this->config('silverback_ai_import.settings')->get('converter_service_url'),
    ];
    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state): void {
    parent::validateForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    $this->config('silverback_ai_import.settings')
      ->set('converter_service_url', $form_state->getValue('converter_service_url'))
      ->set('ai_model', $form_state->getValue('ai_model'))
      ->save();
    parent::submitForm($form, $form_state);
  }
}
