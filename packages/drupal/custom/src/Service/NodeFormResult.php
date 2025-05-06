<?php

namespace Drupal\custom\Service;

use Drupal\node\NodeInterface;

/**
 * Class to hold the result of a node form submission.
 */
class NodeFormResult {

  /**
   * Whether the form submission was successful.
   *
   * @var bool
   */
  protected $success;

  /**
   * The node entity if the submission was successful.
   *
   * @var \Drupal\node\NodeInterface|null
   */
  protected $entity;

  /**
   * Any errors that occurred during form submission.
   *
   * @var array
   */
  protected $errors;

  /**
   * Constructs a new NodeFormResult object.
   *
   * @param bool $success
   *   Whether the form submission was successful.
   * @param \Drupal\node\NodeInterface|null $entity
   *   The node entity if the submission was successful.
   * @param array $errors
   *   Any errors that occurred during form submission.
   */
  public function __construct(bool $success, ?NodeInterface $entity = NULL, array $errors = []) {
    $this->success = $success;
    $this->entity = $entity;
    $this->errors = $errors;
  }

  /**
   * Gets whether the form submission was successful.
   *
   * @return bool
   *   TRUE if the form submission was successful, FALSE otherwise.
   */
  public function isSuccess(): bool {
    return $this->success;
  }

  /**
   * Gets the node entity.
   *
   * @return \Drupal\node\NodeInterface|null
   *   The node entity if the submission was successful, NULL otherwise.
   */
  public function getEntity(): ?NodeInterface {
    return $this->entity;
  }

  /**
   * Gets any errors that occurred during form submission.
   *
   * @return array
   *   An array of errors.
   */
  public function getErrors(): array {
    return $this->errors;
  }

}
