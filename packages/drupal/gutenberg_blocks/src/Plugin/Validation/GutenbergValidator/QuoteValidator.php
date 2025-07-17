<?php

namespace Drupal\gutenberg_blocks\Plugin\Validation\GutenbergValidator;

use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\silverback_gutenberg\GutenbergValidation\GutenbergValidatorBase;

/**
 * Validates quote block content and attributes.
 *
 * @GutenbergValidator(
 *   id="quote_validator",
 *   label = @Translation("Quote validator")
 * )
 */
class QuoteValidator extends GutenbergValidatorBase {
  use StringTranslationTrait;

  /**
   * {@inheritDoc}
   */
  public function applies(array $block): bool {
    return $block['blockName'] === 'custom/quote';
  }

  /**
   * {@inheritDoc}
   */
  public function validatedFields($block = []): array {
    return [
      'quote' => [
        'field_label' => $this->t('Quote text'),
        'rules' => ['required'],
      ],
      'author' => [
        'field_label' => $this->t('Quote author'),
        'rules' => ['required'],
      ],
    ];
  }

}
