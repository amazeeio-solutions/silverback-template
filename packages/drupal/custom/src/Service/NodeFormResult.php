<?php

namespace Drupal\custom\Service;

use Drupal\node\NodeInterface;

/**
 * Class to hold the result of a node form submission.
 */
class NodeFormResult {

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
  public function __construct(public bool $success, public ?NodeInterface $entity = NULL, public array $errors = []) {
  }

}
