<?php

namespace Drupal\custom\Service;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Form\FormBuilderInterface;
use Drupal\Core\Form\FormState;
use Drupal\node\NodeInterface;

/**
 * Master Control Program service.
 *
 * Provides centralized control functionality for the system.
 */
class MCP {

  /**
   * The entity type manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * The form builder.
   *
   * @var \Drupal\Core\Form\FormBuilderInterface
   */
  protected $formBuilder;

  /**
   * Constructs a new MCP service.
   *
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity type manager.
   * @param \Drupal\Core\Form\FormBuilderInterface $form_builder
   *   The form builder.
   */
  public function __construct(
    EntityTypeManagerInterface $entity_type_manager,
    FormBuilderInterface $form_builder,
  ) {
    $this->entityTypeManager = $entity_type_manager;
    $this->formBuilder = $form_builder;
  }

  /**
   * Submits a node form with the provided input values.
   *
   * @param string $node_type
   *   The node bundle type (e.g., 'article', 'page').
   * @param array $form_values
   *   An associative array of form values to submit.
   * @param int|null $node_id
   *   Optional node ID if updating an existing node.
   *
   * @return \Drupal\node\NodeInterface|null
   *   The created or updated node, or NULL if the operation failed.
   *
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   */
  public function submitNodeForm(string $node_type, array $form_values, ?int $node_id = NULL): ?NodeInterface {
    // Load existing node or create a new one.
    if ($node_id) {
      $node = $this->entityTypeManager->getStorage('node')->load($node_id);
      if (!$node) {
        return NULL;
      }
    }
    else {
      $node = $this->entityTypeManager->getStorage('node')->create([
        'type' => $node_type,
      ]);
    }

    // Create a form state with the provided values.
    $form_state = new FormState();
    $form_state->setValues($form_values);
    $form_state->set('node', $node);

    // Get the node form.
    $form_object = $this->entityTypeManager->getFormObject('node', 'default');
    $form_object->setEntity($node);

    // Build and submit the form.
    $form = $this->formBuilder->buildForm($form_object, $form_state);
    $this->formBuilder->submitForm($form_object, $form_state);

    // Check for errors.
    if ($form_state->hasAnyErrors()) {
      return NULL;
    }

    // ai! it should return an object that has a success flag, an optional array of errors and the entity.
    // Return the saved node.
    return $node_id ? $node : $node->id() ? $node : NULL;
  }

}
