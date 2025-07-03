<?php

namespace Drupal\gutenberg_blocks\Plugin\Validation\GutenbergValidator;

use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\silverback_gutenberg\GutenbergValidation\GutenbergCardinalityValidatorInterface;
use Drupal\silverback_gutenberg\GutenbergValidation\GutenbergCardinalityValidatorTrait;
use Drupal\silverback_gutenberg\GutenbergValidation\GutenbergValidatorBase;

/**
 * Validates accordion block structure and content.
 *
 * @GutenbergValidator(
 *   id="accordion_validator",
 *   label = @Translation("Accordion validator")
 * )
 */
class AccordionValidator extends GutenbergValidatorBase {
  use GutenbergCardinalityValidatorTrait;
  use StringTranslationTrait;

  /**
   * {@inheritDoc}
   */
  public function applies(array $block): bool {
    return $block['blockName'] === 'custom/accordion';
  }

  /**
   * {@inheritDoc}
   */
  public function validateContent($block = []): array {
    $expectedChildren = [
      [
        'blockName' => 'custom/accordion-item-text',
        'blockLabel' => $this->t('Accordion'),
        'min' => 1,
        'max' => GutenbergCardinalityValidatorInterface::CARDINALITY_UNLIMITED,
      ],
    ];
    return $this->validateCardinality($block, $expectedChildren);
  }

}
