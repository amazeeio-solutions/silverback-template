<?php

namespace Drupal\entity_create_split\Controller;

use Drupal\Core\Access\AccessResult;
use Drupal\Core\Controller\ControllerBase;

/**
 * Controller for entity creation split functionality.
 */
class EntityCreateSplitController extends ControllerBase {

  /**
   * Route callback to show the first part of the entity create form.
   *
   * @param string $entity_type
   *   The entity type ID.
   * @param string $bundle
   *   The bundle ID.
   *
   * @return array
   *   A render array containing the form.
   *
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   */
  public function createForm($entity_type, $bundle) {
    $entityTypeDefinition = $this->entityTypeManager()->getDefinition($entity_type);
    $bundleKey = $entityTypeDefinition->getKey('bundle');
    $entity = $this->entityTypeManager()->getStorage($entity_type)->create([$bundleKey => $bundle]);
    $entity->disableGutenberg = TRUE;
    $editForm = $this->entityTypeManager()->getFormObject($entity_type, 'split')->setEntity($entity);
    return \Drupal::formBuilder()->getForm($editForm);
  }

  /**
   * Title callback for the createForm() route.
   */
  public function getTitle($entity_type, $bundle) {
    $entityTypeDefinition = $this->entityTypeManager()->getDefinition($entity_type);
    $bundleEntityType = $entityTypeDefinition->getBundleEntityType();
    $bundleLabel = $this->entityTypeManager()->getStorage($bundleEntityType)->load($bundle)->label();
    return $this->t("Create %entity_type: %entity_bundle", [
      '%entity_type' => $entityTypeDefinition->getLabel(),
      '%entity_bundle' => $bundleLabel,
    ]);
  }

  /**
   * Access callback for the createForm() route.
   */
  public function access($entity_type, $bundle) {
    if (!$this->entityTypeManager()->hasDefinition($entity_type)) {
      return AccessResult::forbidden();
    }
    $entityTypeDefinition = $this->entityTypeManager()->getDefinition($entity_type);
    $bundleEntityType = $entityTypeDefinition->getBundleEntityType();
    $bundleEntity = $this->entityTypeManager()->getStorage($bundleEntityType)->load($bundle);
    if (!$bundleEntity) {
      return AccessResult::forbidden();
    }

    return $this->entityTypeManager()
      ->getAccessControlHandler($entity_type)
      ->createAccess($bundle, NULL, [], TRUE);
  }

}
