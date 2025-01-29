<?php

namespace Drupal\custom;

use Drupal\content_moderation\ModerationInformationInterface;
use Drupal\content_moderation\StateTransitionValidationInterface;
use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Session\AccountSwitcherInterface;
use Drupal\Core\Session\UserSession;
use Drupal\graphql_directives\DirectiveArguments;
use Drupal\silverback_preview_link\Access\PreviewLinkAccessCheck;

/**
 * Helper service for managing content moderation with graphql.
 */
class ContentModeration {

  /**
   * The content moderation information service.
   */
  protected ModerationInformationInterface $moderationInformation;

  /**
   * The state transition validation service.
   */
  protected StateTransitionValidationInterface $stateValidator;

  /**
   * The current user service.
   */
  protected AccountInterface $currentUser;

  /**
   * The preview link access check service.
   */
  protected PreviewLinkAccessCheck $previewLinkAccessCheck;

  /**
   * The account switcher service.
   */
  protected AccountSwitcherInterface $accountSwitcher;

  /**
   * Constructs a ContentModeration object.
   *
   * @param \Drupal\content_moderation\ModerationInformationInterface $moderation_information
   * @param \Drupal\content_moderation\StateTransitionValidationInterface $state_validator
   * @param \Drupal\Core\Session\AccountInterface $current_user
   */
  public function __construct(
    ModerationInformationInterface $moderation_information,
    StateTransitionValidationInterface $state_validator,
    AccountInterface $current_user,
    PreviewLinkAccessCheck $preview_link_access_check,
    AccountSwitcherInterface $account_switcher,
  ) {
    $this->moderationInformation = $moderation_information;
    $this->stateValidator = $state_validator;
    $this->currentUser = $current_user;
    $this->previewLinkAccessCheck = $preview_link_access_check;
    $this->accountSwitcher = $account_switcher;
  }

  /**
   * Directive to moderate content.
   */
  public function moderateContent(DirectiveArguments $args) : array {
    \Drupal::logger('debug')->info('Content moderated!: ' . $args->args['contentId'] . ' (' . $args->args['contentType'] . ')');
    return [];
  }

  /**
   * Directive to get the moderation information for content.
   * @param \Drupal\graphql_directives\DirectiveArguments $args
   *
   * @return array
   */
  public function moderationInfo(DirectiveArguments $args): array | null{
    $content = $args->value;
    if (!$content instanceof ContentEntityInterface) {
      return null;
    }
    if (!$this->moderationInformation->isModeratedEntity($content)) {
      return null;
    }
    $userSessionChanged = FALSE;
    try {
      // @todo: maybe the preview_user_id and preview_access_token should be
      // used as an authorisation method, globally, instead of needing to check
      // them on each individual feature. In that case we would not need to
      // use the account switcher service and to temporarily switch the current
      // user session to the one specified by preview_user_id.
      $accessCredentials = $this->getAccessCredentialsFromRequest();
      $previewUserId = $accessCredentials['preview_user_id'];
      $previewAccessToken = $accessCredentials['preview_access_token'];
      if (!empty($previewAccessToken) && !empty($previewUserId) && $this->currentUser->id() != $previewUserId) {
        $accessResult = $this->previewLinkAccessCheck->access($content, $previewAccessToken);
        // If the access token is valid, then we should switch to preview user
        // as well.
        if ($accessResult->isAllowed()) {
          $this->accountSwitcher->switchTo(new UserSession(['uid' => $previewUserId]));
          $userSessionChanged = TRUE;
        }
      }

      $availableStates = $this->getAvailableStatesForContent($content);
      $currentState = $this->moderationInformation->getOriginalState($content);
    } finally {
      // Make sure we switch back to the original session.
      if ($userSessionChanged) {
        $this->accountSwitcher->switchBack();
      }
    }
    return [
      'currentState' => [
        'id' => $currentState->id(),
        'label' => $currentState->label(),
      ],
      'availableStates' => $availableStates,
    ];
  }

  /**
   * Helper method to return an array with all the available states that a
   * content can transition to.
   *
   * @param \Drupal\Core\Entity\ContentEntityInterface $content
   *
   * @return array
   */
  protected function getAvailableStatesForContent(ContentEntityInterface $content): array {
    $transitions = $this->stateValidator->getValidTransitions($content, $this->currentUser);
    $availableStates = [];
    foreach ($transitions as $transition) {
      $transitionTo = $transition->to();
      $availableStates[] = [
        'id' => $transitionTo->id(),
        'label' => $transitionTo->label(),
      ];
    }

    return $availableStates;
  }

  /**
   * Helper method to return the preview access credentials, if they are part of
   * a request.
   *
   * @return array
   */
  protected function getAccessCredentialsFromRequest(): array {
    // If we have a preview_access_token and a preview_user_id, then we need to
    // get the available transitions in the context of that user.
    $request = \Drupal::request();
    $previewAccessToken = $request->get('preview_access_token');
    $previewUserId = $request->get('preview_user_id');
    // When running in the context of a graphql request, the preview_user_id and
    // the preview_access_token should be available in the variables of the
    // query.
    if ($request->get('queryId') && $request->get('variables')) {
      $variablesValues = json_decode($request->get('variables'), true);
      $previewAccessToken = !empty($previewAccessToken) ? $previewAccessToken : $variablesValues['preview_access_token'];
      $previewUserId = !empty($previewUserId) ? $previewUserId : $variablesValues['preview_user_id'];
    }
    return [
      'preview_access_token' => $previewAccessToken,
      'preview_user_id' => $previewUserId,
    ];
  }
}
