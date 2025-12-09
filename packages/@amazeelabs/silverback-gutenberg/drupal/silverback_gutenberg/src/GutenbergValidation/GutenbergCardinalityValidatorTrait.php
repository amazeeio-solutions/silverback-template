<?php

namespace Drupal\silverback_gutenberg\GutenbergValidation;

use Drupal\Component\Utility\Html;
use Drupal\Core\StringTranslation\TranslatableMarkup;

/**
 * Cardinality validator helper.
 */
trait GutenbergCardinalityValidatorTrait {

  /**
   * Validates the cardinality of the inner blocks of a block.
   *
   * This helper can be called from the validateContent() method of a validator.
   *
   * Example to validate the cardinality of all inner blocks (any, no matter the name).
   * @code
   * [
   *   'validationType' => GutenbergCardinalityValidatorInterface::CARDINALITY_ANY,
   *   'min' => 0,
   *   'max' => 3,
   * ]
   * @endcode
   *
   * Example to validate by block name:
   * @code
   * [
   *   [
   *     'blockName' => 'core/paragraph',
   *     'blockLabel' => $this->t('Paragraph'),
   *     'min' => 0,
   *     'max' => 3,
   *   ],
   *   [
   *     'blockName' => 'core/embed',
   *     'blockLabel' => $this->t('Embed'),
   *     'min' => 1,
   *     'max' => 2,
   *   ],
   *   [
   *     'blockName' => 'core/block',
   *     'blockLabel' => $this->t('Reusable block'),
   *     'min' => 1,
   *     'max' => GutenbergCardinalityValidatorInterface::CARDINALITY_UNLIMITED,
   *   ],
   * ];
   * @endcode
   *
   * @param array $block
   * @param array $expected_children
   *
   * @return array
   */
  public function validateCardinality(array $block, array $expected_children): array {
    // Nothing to validate.
    if (empty($expected_children)) {
      return [
        'is_valid' => TRUE,
        'message' => '',
      ];
    }

    // Check if the quantity validation is any block, no matter the name.
    if (
      !empty($expected_children['validationType']) &&
      $expected_children['validationType'] === GutenbergCardinalityValidatorInterface::CARDINALITY_ANY) {
      return $this->validateAnyInnerBlocks($block, $expected_children);
    }

    // Exit early if there are no inner blocks.
    if (empty($block['innerBlocks'])) {
      return $this->validateEmptyInnerBlocks($expected_children);
    }

    // Count blocks and keep references for additional validations.
    $countInnerBlockInstances = [];
    $innerBlocksByName = [];
    foreach ($block['innerBlocks'] as $innerBlock) {
      $blockName = $innerBlock['blockName'] ?? NULL;
      if ($blockName === NULL) {
        continue;
      }
      if (!isset($countInnerBlockInstances[$blockName])) {
        $countInnerBlockInstances[$blockName] = 0;
      }
      $countInnerBlockInstances[$blockName]++;
      $innerBlocksByName[$blockName][] = $innerBlock;
    }

    foreach ($expected_children as $child) {
      $blockName = $child['blockName'];
      $childBlocks = $innerBlocksByName[$blockName] ?? [];

      if (!isset($countInnerBlockInstances[$blockName]) && $child['min'] > 0) {
        $message = $this->getExpectedQuantityErrorMessage($child);
        return [
          'is_valid' => FALSE,
          'message' => $message,
        ];
      }
      // Minimum is set to 0, so we don't care if the block is not present.
      if (!isset($countInnerBlockInstances[$blockName]) && $child['min'] === 0) {
        continue;
      }

      $blockCount = $countInnerBlockInstances[$blockName] ?? 0;
      if ($blockCount < $child['min']) {
        return [
          'is_valid' => FALSE,
          'message' => \Drupal::translation()->formatPlural($child['min'],
            '%label: at least @min block is required.',
            '%label: at least @min blocks are required.',
            [
              '%label' => $child['blockLabel'],
              '@min' => $child['min'],
            ]),
        ];
      }
      if ($child['max'] !== GutenbergCardinalityValidatorInterface::CARDINALITY_UNLIMITED && $blockCount > $child['max']) {
        return [
          'is_valid' => FALSE,
          'message' => \Drupal::translation()->formatPlural($child['max'],
            '%label: at most @max block is allowed.',
            '%label: at most @max blocks are allowed.',
            [
              '%label' => $child['blockLabel'],
              '@max' => $child['max'],
            ]),
        ];
      }

      if (!empty($childBlocks) && !$this->hasPopulatedBlock($childBlocks)) {
        return [
          'is_valid' => FALSE,
          'message' => $this->getMissingContentErrorMessage($child),
        ];
      }
    }

    return [
      'is_valid' => TRUE,
      'message' => '',
    ];
  }

  /**
   * Check if it's fine to not have any inner blocks.
   *
   * Returns a message with all expected children blocks if needed.
   *
   * @param array $expected_children
   *
   * @return array|void
   */
  private function validateEmptyInnerBlocks (array $expected_children): array {
    $missingBlocksMessages = [];
    foreach ($expected_children as $child) {
      if ($child['min'] > 0) {
        $message = $this->getExpectedQuantityErrorMessage($child);
        $missingBlocksMessages[] = $message;
      }
    }
    if (!empty($missingBlocksMessages)) {
      $errorMessage = t('Required blocks are missing.');
      $errorMessage .= ' ' . implode(' ', $missingBlocksMessages);
      return [
        'is_valid' => FALSE,
        'message' => $errorMessage,
      ];
    }

    return [
      'is_valid' => TRUE,
      'message' => '',
    ];
  }

  /**
   * Validates the cardinality of any inner blocks.
   *
   * @param array $inner_blocks
   * @param array $expected_children
   *
   * @return array
   */
  private function validateAnyInnerBlocks(array $inner_blocks, array $expected_children): array {
    $min = $expected_children['min'];
    $max = $expected_children['max'];
    $innerBlockList = $inner_blocks['innerBlocks'] ?? [];
    $count = count($innerBlockList);
    if (
      $count > 0 &&
      !$this->hasPopulatedBlock($innerBlockList) &&
      !$this->isBlockPopulated($inner_blocks)
    ) {
      return [
        'is_valid' => FALSE,
        'message' => $this->getMissingContentErrorMessage(NULL),
      ];
    }
    if ($count < $min) {
      return [
        'is_valid' => FALSE,
        'message' => \Drupal::translation()->formatPlural($min,
          'At least @min block is required.',
          'At least @min blocks are required.',
          [
            '@min' => $min,
          ]),
      ];
    }
    if ($max !== GutenbergCardinalityValidatorInterface::CARDINALITY_UNLIMITED && $count > $max) {
      return [
        'is_valid' => FALSE,
        'message' => \Drupal::translation()->formatPlural($max,
          'At most @max block is allowed.',
          'At most @max blocks are allowed.',
          [
            '@max' => $max,
          ]),
      ];
    }

    return [
      'is_valid' => TRUE,
      'message' => '',
    ];
  }

  private function getExpectedQuantityErrorMessage(array $child_block): string|TranslatableMarkup {
    $messageParams = [
      '%label' => $child_block['blockLabel'],
      '@min' => $child_block['min'],
      '@max' => $child_block['max'] > 0 ? $child_block['max'] : t('unlimited'),
    ];
    $result = t('%label: there should be between @min and @max blocks.', $messageParams);
    if ($child_block['min'] === $child_block['max']) {
      $result = \Drupal::translation()->formatPlural($child_block['min'],
        '%label: there should be exactly @min block.',
        '%label: there should be exactly @min blocks.',
        $messageParams);
    }
    return $result;
  }

  private function blockHasMeaningfulHtml(array $block): bool {
    $innerHTML = $block['innerHTML'] ?? '';
    if (is_string($innerHTML) && $this->stringContainsContent($innerHTML)) {
      return TRUE;
    }

    if (!empty($block['innerContent']) && is_array($block['innerContent'])) {
      foreach ($block['innerContent'] as $chunk) {
        if (is_string($chunk) && $this->stringContainsContent($chunk)) {
          return TRUE;
        }
      }
    }

    return FALSE;
  }

  private function stringContainsContent(string $value): bool {
    $decoded = Html::decodeEntities($value);
    $stripped = trim(strip_tags($decoded));
    if ($stripped !== '') {
      return TRUE;
    }

    return (bool) preg_match('/<(img|video|audio|iframe|svg|figure|source|embed|object|picture)\b/i', $value);
  }

  private function blockHasMeaningfulAttributes(array $block): bool {
    $attrs = $block['attrs'] ?? [];
    if (empty($attrs)) {
      return FALSE;
    }

    foreach ($attrs as $value) {
      if ($this->isMeaningfulValue($value)) {
        return TRUE;
      }
    }

    return FALSE;
  }

  private function isMeaningfulValue(mixed $value): bool {
    if ($value === NULL) {
      return FALSE;
    }
    if (is_string($value)) {
      return trim($value) !== '';
    }
    if (is_bool($value)) {
      return $value;
    }
    if (is_numeric($value)) {
      return TRUE;
    }
    if (is_array($value)) {
      foreach ($value as $item) {
        if ($this->isMeaningfulValue($item)) {
          return TRUE;
        }
      }
      return FALSE;
    }

    return TRUE;
  }

  /**
   * Checks if any block in the supplied list is populated.
   */
  private function hasPopulatedBlock(array $blocks): bool {
    foreach ($blocks as $block) {
      if (is_array($block) && $this->isBlockPopulated($block)) {
        return TRUE;
      }
    }
    return FALSE;
  }

  private function isBlockPopulated(array $block): bool {
    $evaluated = FALSE;

    if (array_key_exists('innerHTML', $block) || array_key_exists('innerContent', $block)) {
      $evaluated = TRUE;
      if ($this->blockHasMeaningfulHtml($block)) {
        return TRUE;
      }
    }

    if (array_key_exists('attrs', $block)) {
      $evaluated = TRUE;
      if ($this->blockHasMeaningfulAttributes($block)) {
        return TRUE;
      }
    }

    if (!empty($block['innerBlocks']) && is_array($block['innerBlocks'])) {
      $evaluated = TRUE;
      foreach ($block['innerBlocks'] as $innerBlock) {
        if (is_array($innerBlock) && $this->isBlockPopulated($innerBlock)) {
          return TRUE;
        }
      }
    }

    if (!$evaluated) {
      return TRUE;
    }

    return FALSE;
  }

  private function getMissingContentErrorMessage(?array $child_block): string|TranslatableMarkup {
    $messageSuffix = t('content or attributes.');

    if (!empty($child_block)) {
      $messageParams = [
        '%label' => $child_block['blockLabel'],
        '@message_suffix' => $messageSuffix,
      ];
      return t('%label: block must contain @message_suffix', $messageParams);
    }

    return t('Block must contain @message_suffix', [
      '@message_suffix' => $messageSuffix,
    ]);
  }

}
