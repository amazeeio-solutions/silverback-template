<?php

use Drupal\Core\StringTranslation\TranslatableMarkup;
use Drupal\user\Entity\User;

function custom_deploy_set_default_preview_user(array &$sandbox): string {
  $defaultPreviewUser = \Drupal::state()->get('silverback_preview_link.default_preview_user');
  // If there is no preview user set, then we want to just search for the first
  // user having the `preview` role.
  if (empty($defaultPreviewUser)) {
    $query = \Drupal::entityQuery('user')
      ->condition('roles', 'preview')
      ->accessCheck(FALSE)
      ->range(0, 1);
    $defaultPreviewUser = $query->execute();
    if (!empty($defaultPreviewUser)) {
      $defaultPreviewUser = reset($defaultPreviewUser);
    }
    if (empty($defaultPreviewUser)) {
      return t('No preview user found. For the preview links to work properly, you need to create a user having the `preview` role and set it as the default preview user at /admin/config/content/silverback_preview_link');
    }
    \Drupal::state()->set('silverback_preview_link.default_preview_user', $defaultPreviewUser);

    $previewUser = User::load($defaultPreviewUser);
    return t('Default preview user set to @user', ['@user' => $previewUser->getAccountName()]);
  }
  return t('Default preview user already set.');
}

/**
 * Create the Publisher OAuth Consumer.
 */
function custom_deploy_create_publisher_consumer(array &$sandbox): string {
  return _custom_deploy_create_consumer(
    'Publisher',
    'publisher',
    'PUBLISHER_OAUTH2_CLIENT_SECRET',
    'PUBLISHER_URL'
  );
}

/**
 * Create the Preview OAuth Consumer.
 */
function custom_deploy_create_preview_consumer(array &$sandbox): string {
  return _custom_deploy_create_consumer(
    'Preview',
    'preview',
    'PREVIEW_OAUTH2_CLIENT_SECRET',
    'PREVIEW_URL'
  );
}

/**
 * Helper function to create an OAuth Consumer if it does not exist.
 *
 * @param string $label
 * @param string $client_id
 * @param string $client_secret_env_var
 * @param string $redirect_base_url_env_var
 *
 * @return string|\Drupal\Core\StringTranslation\TranslatableMarkup
 * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
 * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
 * @throws \Drupal\Core\Entity\EntityStorageException
 */
function _custom_deploy_create_consumer(
  string $label,
  string $client_id,
  string $client_secret_env_var,
  string $redirect_base_url_env_var
): string|TranslatableMarkup {
  // Skip for Silverback environments.
  // It might be used for OAuth development purpose only in Silverback
  // and can be created manually for this case.
  // Matches the default behaviour that disables it for non Lagoon environments.
  if (getenv('SB_ENVIRONMENT')) {
    return t('Skip for Silverback environment.');
  }

  // Check requirements.
  $entityTypeManager = \Drupal::entityTypeManager();

  $redirectBaseUrl = getenv($redirect_base_url_env_var);
  if (!$redirectBaseUrl) {
    throw new \Exception(
      t('@ENV_VAR environment variable is not set. It is required to create the OAuth Consumer.',
        [
          '@ENV_VAR' => $redirect_base_url_env_var,
        ]
      )
    );
  }

  $clientSecret = getenv($client_secret_env_var);
  if (!$clientSecret) {
    throw new \Exception(
      t('@ENV_VAR environment variable is not set. It is required to create the OAuth Consumer.',
        [
          '@ENV_VAR' => $client_secret_env_var,
        ]
      )
    );
  }

  $consumersStorage = $entityTypeManager->getStorage('consumer');
  $existingConsumers = $consumersStorage->loadMultiple();
  $consumerExists = FALSE;
  /** @var \Drupal\consumers\Entity\ConsumerInterface $consumer */
  foreach ($existingConsumers as $consumer) {
    // As a side effect, delete the default consumer.
    // It is installed by the Consumers module.
    // We don't use in the template.
    if ($consumer->getClientId() === 'default_consumer') {
      $consumer->delete();
    }
    if ($consumer->getClientId() === $client_id) {
      $consumerExists = TRUE;
    }
  }

  // Create the Consumer if it does not exist.
  if (!$consumerExists) {
    $oAuthCallback = $redirectBaseUrl . '/oauth/callback';
    $consumersStorage->create([
      'label' => $label,
      'client_id' => $client_id,
      'is_default' => FALSE,
      'third_party' => FALSE,
      'secret' => $clientSecret,
      'redirect' => $oAuthCallback,
    ])->save();
    return t('Created @consumer OAuth Consumer.', ['@consumer' => $label]);
  }

  return t('@consumer OAuth Consumer already exists.', ['@consumer' => $label]);
}
