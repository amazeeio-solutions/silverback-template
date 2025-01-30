<?php

namespace Drupal\custom;

use Drupal\Component\Datetime\TimeInterface;
use Drupal\content_moderation\ModerationInformationInterface;
use Drupal\content_moderation\StateTransitionValidationInterface;
use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Entity\RevisionableInterface;
use Drupal\Core\Entity\RevisionableStorageInterface;
use Drupal\Core\Entity\RevisionLogInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Session\AccountSwitcherInterface;
use Drupal\Core\Session\UserSession;
use Drupal\Core\Utility\Error;
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
   * The datetime service.
   */
  protected TimeInterface $time;

  /**
   * Constructs a ContentModeration object.
   *
   * @param \Drupal\content_moderation\ModerationInformationInterface $moderation_information
   * @param \Drupal\content_moderation\StateTransitionValidationInterface $state_validator
   * @param \Drupal\Core\Session\AccountInterface $current_user
   * @param \Drupal\silverback_preview_link\Access\PreviewLinkAccessCheck $preview_link_access_check
   * @param \Drupal\Core\Session\AccountSwitcherInterface $account_switcher
   * @param \Drupal\Component\Datetime\TimeInterface $time
   */
  public function __construct(
    ModerationInformationInterface $moderation_information,
    StateTransitionValidationInterface $state_validator,
    AccountInterface $current_user,
    PreviewLinkAccessCheck $preview_link_access_check,
    AccountSwitcherInterface $account_switcher,
    TimeInterface $time
  ) {
    $this->moderationInformation = $moderation_information;
    $this->stateValidator = $state_validator;
    $this->currentUser = $current_user;
    $this->previewLinkAccessCheck = $preview_link_access_check;
    $this->accountSwitcher = $account_switcher;
    $this->time = $time;
  }

  /**
   * Directive to moderate content.
   */
  public function moderateContent(DirectiveArguments $args) : array {
    $userSessionChanged = FALSE;
    try {
      // For the moderateContent action, the access credentials should be inside
      // the directive arguments.
      // @todo: this might need a bigger refactoring, so that the request gets
      // authenticated based on the preview_user_id and preview_access_token
      // globally, so we do not need to perform the authorisation in this
      // method.
      $previewUserId = $args->args['accessCredentials']['previewUserId'];
      $previewAccessToken = $args->args['accessCredentials']['previewAccessToken'];
      /* @var \Drupal\Core\Entity\RevisionableStorageInterface $storage */
      $storage = \Drupal::entityTypeManager()
        ->getStorage($args->args['entityType']);
      if (!$storage instanceof RevisionableStorageInterface) {
        throw new \Exception("The " . $args->args['entityType'] . ' entity storage is not revisionable.');
      }
      $content = $storage->loadRevision($args->args['revisionId']);
      if (!empty($previewAccessToken) && !empty($previewUserId) && $this->currentUser->id() != $previewUserId) {
        $accessResult = $this->previewLinkAccessCheck->access($content, $previewAccessToken);
        // If the access token is valid, then we should switch to preview user
        // as well.
        if ($accessResult->isAllowed()) {
          $this->accountSwitcher->switchTo(new UserSession(['uid' => $previewUserId]));
          $userSessionChanged = TRUE;
        }
      }
      $submittedData = json_decode($args->args['submittedData'], true);
      // Check again if the transition is allowed.
      $workflow = $this->moderationInformation->getWorkflowForEntity($content);
      $currentState = $this->moderationInformation->getOriginalState($content);
      $newState = $workflow->getTypePlugin()->getState($submittedData['new_moderation_state']);
      if (!$this->stateValidator->isTransitionValid($workflow, $currentState, $newState, $this->currentUser, $content)) {
        throw new \Exception("The moderation state could not be changed. Transition from " .$currentState->id() . ' to  ' . $newState->id() . ' is not allowed (' . $args->args['entityType'] . '; ' . $args->args['contentId'] . ') for user id: ' .$this->currentUser->id());
      }

      // If we get here, then we are allowed to change the moderation state, so
      // we try to do it.
      $this->changeModerationStateForContent($content, $submittedData['new_moderation_state'], $submittedData['comment'], $submittedData['name']);
      return [
        'result' => 'success',
        'errors' => NULL,
      ];
    }
    catch (\Exception $e) {
      Error::logException(\Drupal::logger('error'), $e);
      return [
        'result' => 'error',
        'errors' => [
          [
            'message' => 'The moderation state could not be changed. Check the application logs for more details.',
            'key' => 'invalid_input'
          ]
        ],
      ];
    }
    finally {
      // Make sure we switch back to the original session.
      if ($userSessionChanged) {
        $this->accountSwitcher->switchBack();
      }
    }
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

  /**
   * Helper method to change the moderation state of a cnotent.
   *
   * @param \Drupal\Core\Entity\RevisionableInterface $content
   * @param string $new_state
   * @param string $comment
   * @param string $author_name
   *
   * @return void
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   * @throws \Drupal\Core\Entity\EntityStorageException
   */
  protected function changeModerationStateForContent(RevisionableInterface $content, string $new_state, string $comment, string $author_name) {
    /* @var \Drupal\Core\Entity\RevisionableStorageInterface $storage */
    $storage = \Drupal::entityTypeManager()->getStorage($content->getEntityTypeId());
    $content = $storage->createRevision($content, $content->isDefaultRevision());
    $content->set('moderation_state', $new_state);
    if ($content instanceof RevisionLogInterface) {
      $content->setRevisionCreationTime($this->time->getRequestTime());
      $content->setRevisionLogMessage($comment . ' (' . $author_name . ')');
      $content->setRevisionUserId($this->currentUser->id());
    }
    $content->save();
  }
}
