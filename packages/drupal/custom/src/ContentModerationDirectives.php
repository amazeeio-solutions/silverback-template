<?php

namespace Drupal\custom;

use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Entity\RevisionableInterface;
use Drupal\Core\Entity\RevisionableStorageInterface;
use Drupal\Core\Entity\RevisionLogInterface;
use Drupal\Core\Utility\Error;
use Drupal\graphql_directives\Api;

/**
 * Helper service for managing content moderation with graphql.
 */
class ContentModerationDirectives {

  /**
   * Directive to moderate content.
   *
   * @param \Drupal\graphql_directives\Api $api
   *
   * @return array
   */
  public static function moderateContent(Api $api) : array {
    try {
      /* @var \Drupal\Core\Entity\RevisionableStorageInterface $storage */
      $storage = \Drupal::entityTypeManager()
        ->getStorage($api->args['entityType']);
      if (!$storage instanceof RevisionableStorageInterface) {
        throw new \Exception("The " . $api->args['entityType'] . ' entity storage is not revisionable.');
      }
      $content = $storage->loadRevision($api->args['revisionId']);
      $submittedData = json_decode($api->args['submittedData'], true);
      /* @var \Drupal\content_moderation\ModerationInformationInterface $moderationInformation */
      $moderationInformation = \Drupal::service('content_moderation.moderation_information');
      /* @var \Drupal\content_moderation\StateTransitionValidationInterface $stateValidator */
      $stateValidator = \Drupal::service('content_moderation.state_transition_validation');
      /* @var \Drupal\Core\Session\AccountInterface $currentUser */
      $currentUser = \Drupal::currentUser();

      // Check again if the transition is allowed.
      $workflow = $moderationInformation->getWorkflowForEntity($content);
      $currentState = $moderationInformation->getOriginalState($content);
      $newState = $workflow->getTypePlugin()->getState($submittedData['new_moderation_state']);
      if (!$stateValidator->isTransitionValid($workflow, $currentState, $newState, $currentUser, $content)) {
        throw new \Exception("The moderation state could not be changed. Transition from " .$currentState->id() . ' to  ' . $newState->id() . ' is not allowed (' . $api->args['entityType'] . '; ' . $api->args['contentId'] . ') for user id: ' .$currentUser->id());
      }

      // If we get here, then we are allowed to change the moderation state, so
      // we try to do it.
      self::changeModerationStateForContent($content, $submittedData['new_moderation_state'], $submittedData['comment'], $submittedData['name']);
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
  }

  /**
   * Directive to get the moderation information for content.
   * @param \Drupal\graphql_directives\Api $api
   *
   * @return array
   */
  public static function moderationInfo(Api $api): array | null{
    $content = $api->parent;
    if (!$content instanceof ContentEntityInterface) {
      return null;
    }
    /* @var \Drupal\content_moderation\ModerationInformationInterface $moderationInformation */
    $moderationInformation = \Drupal::service('content_moderation.moderation_information');
    if (!$moderationInformation->isModeratedEntity($content)) {
      return null;
    }
    $availableStates = self::getAvailableStatesForContent($content);
    $currentState = $moderationInformation->getOriginalState($content);

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
  protected static function getAvailableStatesForContent(ContentEntityInterface $content): array {
    /* @var \Drupal\content_moderation\StateTransitionValidationInterface $stateValidator */
    $stateValidator = \Drupal::service('content_moderation.state_transition_validation');
    /* @var \Drupal\Core\Session\AccountInterface $currentUser */
    $currentUser = \Drupal::currentUser();

    $transitions = $stateValidator->getValidTransitions($content, $currentUser);
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
  protected static function changeModerationStateForContent(RevisionableInterface $content, string $new_state, string $comment, string $author_name) {
    /* @var \Drupal\Core\Entity\RevisionableStorageInterface $storage */
    $storage = \Drupal::entityTypeManager()->getStorage($content->getEntityTypeId());
    $content = $storage->createRevision($content, $content->isDefaultRevision());
    $content->set('moderation_state', $new_state);
    /* @var \Drupal\Component\Datetime\TimeInterface $time */
    $time = \Drupal::service('datetime.time');
    /* @var \Drupal\Core\Session\AccountInterface $currentUser */
    $currentUser = \Drupal::currentUser();

    if ($content instanceof RevisionLogInterface) {
      $content->setRevisionCreationTime($time->getRequestTime());
      $content->setRevisionLogMessage($comment . ' (' . $author_name . ')');
      $content->setRevisionUserId($currentUser->id());
    }
    $content->save();
  }
}
