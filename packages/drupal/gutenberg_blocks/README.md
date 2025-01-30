# Gutenberg blocks

## Custom Gutenberg block creation

To create a custom Gutenberg you must:

1. Create a `.tsx` file in `js/blocks`, using one of the existing examples as a
   starting point.
2. Include the file within `js/index.ts` - this file is used to generate the
   javascript file included by the Drupal module.
3. Clear the cache if necessary and you should be able to add your new block
   within the Gutenberg editor.

### GraphQL type-based Gutenberg block auto-generation

To speed up the process of creating new blocks, you can use the command below to
create a new block based on a GraphQL type.

```
pnpm gutenberg:generate <GraphQLType>
```

This will create a new block in the `js/blocks` directory, with the necessary
fields and attributes already defined. You will still need to add the block to
`js/index.ts` and clear the cache to see the new block in the Gutenberg editor
after running this command.

### Icons

You can find the icon set in use within the Gutenberg editor here:
https://developer.wordpress.org/resource/dashicons/

## Validation

Custom validator plugins can be created in
`src/Plugin/Validation/GutenbergValidator`

### Field level validation

Example: to validate that an email is valid and required.

- the block name is `custom/my-block`
- the field attribute is `email` and the label `Email`

```php
<?php

namespace Drupal\gutenberg_blocks\Plugin\Validation\GutenbergValidator;

use Drupal\silverback_gutenberg\GutenbergValidation\GutenbergValidatorBase;
use Drupal\Core\StringTranslation\StringTranslationTrait;

/**
 * @GutenbergValidator(
 *   id="my_block_validator",
 *   label = @Translation("My block validator")
 * )
 */
class MyBlockValidator extends GutenbergValidatorBase {

  use StringTranslationTrait;

  /**
   * {@inheritDoc}
   */
  public function applies(array $block) {
    return $block['blockName'] === 'custom/my-block';
  }

  /**
   * {@inheritDoc}
   */
  public function validatedFields(array $block = []) {
    return [
      'email' => [
        'field_label' => $this->t('Email'),
        'rules' => ['required', 'email'],
      ],
    ];
  }

}
```

### Block level validation

Perform custom block validation logic then return the result.

```php
public function validateContent(array $block) {
  $isValid = TRUE;

  // Custom validation logic.
  // (...)

  if (!$isValid) {
    return [
      'is_valid' => FALSE,
      'message' => 'Message',
    ];
  }

  // Passes validation.
  return [
    'is_valid' => TRUE,
    'message' => '',
  ];
}
```

### Cardinality validation

#### Backend

Uses the `validateContent()` method as a wrapper, with the cardinality validator
trait.

```php
use GutenbergCardinalityValidatorTrait;
```

Validate a given block type for inner blocks.

```php
public function validateContent(array $block) {
  $expectedChildren = [
    [
      'blockName' => 'custom/teaser',
      'blockLabel' => $this->t('Teaser'),
      'min' => 1,
      'max' => 2,
    ],
  ];
  return $this->validateCardinality($block, $expectedChildren);
}
```

Validate any kind of block type for inner blocks.

```php
public function validateContent(array $block) {
  $expectedChildren = [
    'validationType' => GutenbergCardinalityValidatorInterface::CARDINALITY_ANY,
    'min' => 0,
    'max' => 1,
  ];
  return $this->validateCardinality($block, $expectedChildren);
}
```

Validate a minimum with no maximum.

```php
public function validateContent(array $block) {
  $expectedChildren = [
    [
      'blockName' => 'custom/teaser',
      'blockLabel' => $this->t('Teaser'),
      'min' => 1,
      'max' => GutenbergCardinalityValidatorInterface::CARDINALITY_UNLIMITED,
    ],
  ];
  return $this->validateCardinality($block, $expectedChildren);
}
```

#### Client side alternative

Client side cardinality validation can also be done in custom blocks with this
pattern.

- use `getBlockCount`
- remove the `InnerBlocks` appender when the limit is reached

```tsx
import { registerBlockType } from 'wordpress__blocks';
import { InnerBlocks } from 'wordpress__block-editor';
import { useSelect } from 'wordpress__data';

const MAX_BLOCKS: number = 1;

registerBlockType('custom/my-block', {
  title: Drupal.t('My Block'),
  icon: 'location',
  category: 'layout',
  attributes: {},
  edit: (props) => {
    const { blockCount } = useSelect((select) => ({
      blockCount: select('core/block-editor').getBlockCount(props.clientId),
    }));
    return (
      <div>
        <InnerBlocks
          templateLock={false}
          renderAppender={() => {
            if (blockCount >= MAX_BLOCKS) {
              return null;
            } else {
              return <InnerBlocks.ButtonBlockAppender />;
            }
          }}
          allowedBlocks={['core/block']}
          template={[]}
        />
      </div>
    );
  },
  save: () => {
    return <InnerBlocks.Content />;
  },
});
```
