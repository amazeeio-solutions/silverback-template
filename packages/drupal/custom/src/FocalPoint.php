<?php

namespace Drupal\custom;

use Drupal\crop\Entity\Crop;
use Drupal\file\Entity\File;
use Drupal\graphql_directives\DirectiveArguments;

/**
 * Helper service for focalpoint information.
 */
class FocalPoint {

  /**
   * Retrieve the focal point of an image entity.
   *
   * @param \Drupal\graphql_directives\DirectiveArguments $args
   *   The directive arguments.
   *
   * @return array
   *   The focal point coordinates.
   */
  public static function getFocalPoint(DirectiveArguments $args) : ?array {
    if (!class_exists(Crop::class)) {
      return [];
    }
    if ($args->value instanceof File) {
      $filePath = $args->value->getFileUri();

      $crop = Crop::findCrop($filePath, 'focal_point');
      $x = $crop?->x->value;
      $y = $crop?->y->value;
      if ($x && $y) {
        return [
          $x,
          $y,
        ];
      }
    }
  }

}
