<?php

namespace Drupal\gutenberg_blocks\Plugin\Validation\GutenbergValidator;

use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\silverback_gutenberg\GutenbergValidation\GutenbergCardinalityValidatorInterface;
use Drupal\silverback_gutenberg\GutenbergValidation\GutenbergCardinalityValidatorTrait;
use Drupal\silverback_gutenberg\GutenbergValidation\GutenbergValidatorBase;

/**
 * @GutenbergValidator(
 *   id="info_grid_validator",
 *   label = @Translation("Info Grid validator")
 * )
 */
class InfoGridValidator extends GutenbergValidatorBase {
  use GutenbergCardinalityValidatorTrait;
  use StringTranslationTrait;

  /**
   * {@inheritDoc}
   */
  public function applies(array $block): bool {
    return $block['blockName'] === 'custom/info-grid';
  }

  /**
   * {@inheritDoc}
   */
  public function validateContent($block = []): array {
    $expectedChildren = [
      [
        'blockName' => 'custom/info-grid-item',
        'blockLabel' => $this->t('Info Grid Item'),
        'min' => 1,
        'max' => GutenbergCardinalityValidatorInterface::CARDINALITY_UNLIMITED,
      ],
    ];
    return $this->validateCardinality($block, $expectedChildren);
  }

}
