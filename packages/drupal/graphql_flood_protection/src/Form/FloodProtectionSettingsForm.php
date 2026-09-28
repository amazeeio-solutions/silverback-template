<?php

namespace Drupal\graphql_flood_protection\Form;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\graphql_flood_protection\Service\MutationDiscovery;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Configure GraphQL Flood Protection settings for this site.
 */
class FloodProtectionSettingsForm extends ConfigFormBase {

  /**
   * Constructs a FloodProtectionSettingsForm object.
   *
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entityTypeManager
   *   The entity type manager.
   * @param \Drupal\graphql_flood_protection\Service\MutationDiscovery $mutationDiscovery
   *   The mutation discovery service.
   */
  public function __construct(
    private readonly EntityTypeManagerInterface $entityTypeManager,
    private readonly MutationDiscovery $mutationDiscovery,
  ) {
    parent::__construct(\Drupal::configFactory());
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('entity_type.manager'),
      $container->get('graphql_flood_protection.mutation_discovery')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'graphql_flood_protection_settings';
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return ['graphql_flood_protection.settings'];
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->config('graphql_flood_protection.settings');

    $form['rate_limiting'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Rate Limiting Settings'),
      '#description' => $this->t('Configure how many GraphQL mutations are allowed per IP address within a specified time window.'),
    ];

    $form['rate_limiting']['ip_limit'] = [
      '#type' => 'number',
      '#title' => $this->t('IP Limit'),
      '#description' => $this->t('Maximum number of GraphQL mutations allowed per IP address within the time window.'),
      '#default_value' => $config->get('ip_limit'),
      '#min' => 1,
      '#max' => 1000,
      '#required' => TRUE,
    ];

    $form['rate_limiting']['ip_window'] = [
      '#type' => 'number',
      '#title' => $this->t('IP Window (seconds)'),
      '#description' => $this->t('Time window in seconds for rate limiting. Default is 3600 seconds (1 hour).'),
      '#default_value' => $config->get('ip_window'),
      '#min' => 60,
      '#max' => 86400,
      '#required' => TRUE,
    ];

    $form['rate_limiting']['help'] = [
      '#type' => 'html_tag',
      '#tag' => 'div',
      '#attributes' => [
        'class' => ['description'],
      ],
      '#value' => $this->t('Example: With limit 50 and window 3600, each IP can make 50 GraphQL mutations per hour.'),
    ];

    // Mutation filtering settings.
    $form['mutation_filtering'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Mutation Filtering'),
      '#description' => $this->t('Configure which mutations are protected by rate limiting.'),
    ];

    // Load GraphQL servers.
    $servers = $this->entityTypeManager
      ->getStorage('graphql_server')
      ->loadMultiple();

    $server_options = ['' => $this->t('- Select a server -')];
    foreach ($servers as $server) {
      $server_options[$server->id()] = $server->label();
    }

    $form['mutation_filtering']['server_id'] = [
      '#type' => 'select',
      '#title' => $this->t('GraphQL Server'),
      '#description' => $this->t('Select the GraphQL server to load mutations from. This is required for mutation filtering.'),
      '#options' => $server_options,
      '#default_value' => $config->get('server_id'),
      '#ajax' => [
        'callback' => '::ajaxUpdateMutations',
        'wrapper' => 'mutations-wrapper',
        'event' => 'change',
      ],
    ];

    $form['mutation_filtering']['protection_mode'] = [
      '#type' => 'radios',
      '#title' => $this->t('Protection Mode'),
      '#options' => [
        'all_mutations' => $this->t('Protect all mutations'),
      ],
      '#default_value' => $config->get('protection_mode') ?: 'all_mutations',
      '#description' => $this->t('All GraphQL mutations will be rate-limited by default.'),
    ];

    // Container for mutation exclusions that will be updated via AJAX.
    $form['mutation_filtering']['mutations_wrapper'] = [
      '#type' => 'container',
      '#attributes' => ['id' => 'mutations-wrapper'],
    ];

    // Get the selected server ID (either from form state or config).
    $selected_server_id = $form_state->getValue('server_id') ?? $config->get('server_id');

    if (!empty($selected_server_id)) {
      $mutations = $this->mutationDiscovery->getMutationsForServer($selected_server_id);

      if (!empty($mutations)) {
        $form['mutation_filtering']['mutations_wrapper']['excluded_mutations'] = [
          '#type' => 'checkboxes',
          '#title' => $this->t('Exclude these mutations from protection'),
          '#description' => $this->t('Selected mutations will NOT be rate limited. Leave all unchecked to protect all mutations.'),
          '#options' => $mutations,
          '#default_value' => $config->get('excluded_mutations') ?: [],
        ];
      }
      else {
        $form['mutation_filtering']['mutations_wrapper']['no_mutations'] = [
          '#type' => 'markup',
          '#markup' => '<div class="messages messages--warning">' . $this->t('No mutations found for the selected server.') . '</div>',
        ];
      }
    }
    else {
      $form['mutation_filtering']['mutations_wrapper']['select_server'] = [
        '#type' => 'markup',
        '#markup' => '<div class="description">' . $this->t('Select a GraphQL server above to configure mutation exclusions.') . '</div>',
      ];
    }

    return parent::buildForm($form, $form_state);
  }

  /**
   * AJAX callback to update the mutations list.
   *
   * @param array $form
   *   The form array.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The form state.
   *
   * @return array
   *   The mutations wrapper element.
   */
  public function ajaxUpdateMutations(array &$form, FormStateInterface $form_state) {
    return $form['mutation_filtering']['mutations_wrapper'];
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {
    parent::validateForm($form, $form_state);

    $ip_limit = $form_state->getValue('ip_limit');
    $ip_window = $form_state->getValue('ip_window');

    if ($ip_limit < 1) {
      $form_state->setErrorByName('ip_limit', $this->t('IP limit must be at least 1.'));
    }

    if ($ip_window < 60) {
      $form_state->setErrorByName('ip_window', $this->t('IP window must be at least 60 seconds.'));
    }

    if ($ip_window > 86400) {
      $form_state->setErrorByName('ip_window', $this->t('IP window cannot exceed 86400 seconds (24 hours).'));
    }
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    // Filter out unchecked checkboxes (they come as 0).
    $excluded_mutations = array_filter($form_state->getValue('excluded_mutations') ?: []);

    $this->config('graphql_flood_protection.settings')
      ->set('ip_limit', $form_state->getValue('ip_limit'))
      ->set('ip_window', $form_state->getValue('ip_window'))
      ->set('server_id', $form_state->getValue('server_id'))
      ->set('protection_mode', $form_state->getValue('protection_mode'))
      ->set('excluded_mutations', array_values($excluded_mutations))
      ->save();

    parent::submitForm($form, $form_state);

    $this->messenger()->addStatus($this->t('GraphQL Flood Protection settings have been updated.'));
  }

} 