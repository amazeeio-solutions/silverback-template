<?php

namespace Drupal\custom\Service;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Form\FormBuilderInterface;
use Drupal\Core\Form\FormState;
use Drupal\graphql_directives\Api;

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
   * Create a new Page.
   */
  public function createPage(Api $api) : NodeFormResult {
    return $this->submitNodeForm(form_values: ['title[0][value]' => $api->args['title']], node_type: 'page');
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
   * @return \Drupal\custom\Service\NodeFormResult
   *   An object containing the success status, any errors, and the entity if successful.
   *
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   */
  public function submitNodeForm(string $node_type, array $form_values, ?int $node_id = NULL): NodeFormResult {
    // Load existing node or create a new one.
    if ($node_id) {
      $node = $this->entityTypeManager->getStorage('node')->load($node_id);
      if (!$node) {
        return new NodeFormResult(FALSE, NULL, ['Node not found']);
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
    // ai! use the "mcp" form display mode here.
    //
    $form_object = $this->entityTypeManager->getFormObject('node', 'default');
    $form_object->setEntity($node);

    // Build and submit the form.
    $form = $this->formBuilder->buildForm($form_object, $form_state);
    $this->formBuilder->submitForm($form_object, $form_state);

    // Check for errors.
    if ($form_state->hasAnyErrors()) {
      return new NodeFormResult(
        FALSE,
        NULL,
        $form_state->getErrors()
      );
    }

    // Return the result with the saved node.
    $savedNode = $node_id ? $node : ($node->id() ? $node : NULL);
    return new NodeFormResult(
      $savedNode !== NULL,
      $savedNode,
      []
    );
  }

}
