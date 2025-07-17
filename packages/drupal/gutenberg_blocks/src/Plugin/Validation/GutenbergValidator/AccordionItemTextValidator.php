<?php

namespace Drupal\gutenberg_blocks\Plugin\Validation\GutenbergValidator;

use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\silverback_gutenberg\GutenbergValidation\GutenbergCardinalityValidatorInterface;
use Drupal\silverback_gutenberg\GutenbergValidation\GutenbergCardinalityValidatorTrait;
use Drupal\silverback_gutenberg\GutenbergValidation\GutenbergValidatorBase;

/**
 * Validates accordion item text content and structure.
 *
 * @GutenbergValidator(
 *   id="accordion_item_text_validator",
 *   label = @Translation("Accordion Item Text validator")
 * )
 */
class AccordionItemTextValidator extends GutenbergValidatorBase {
  use GutenbergCardinalityValidatorTrait;
  use StringTranslationTrait;

  /**
   * {@inheritDoc}
   */
  public function applies(array $block): bool {
    return $block['blockName'] === 'custom/accordion-item-text';
  }

  /**
   * {@inheritDoc}
   */
  public function validatedFields($block = []): array {
    return [
      'title' => [
        'field_label' => $this->t('Title'),
        'rules' => ['required'],
      ],
    ];
  }

  /**
   * {@inheritDoc}
   */
  public function validateContent($block = []): array {
    $expectedChildren = [
      'validationType' => GutenbergCardinalityValidatorInterface::CARDINALITY_ANY,
      'min' => 1,
      'max' => GutenbergCardinalityValidatorInterface::CARDINALITY_UNLIMITED,
    ];
    return $this->validateCardinality($block, $expectedChildren);
  }

}
