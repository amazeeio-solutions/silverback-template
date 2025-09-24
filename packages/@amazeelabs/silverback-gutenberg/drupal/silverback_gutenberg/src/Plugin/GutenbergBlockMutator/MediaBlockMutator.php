<?php

namespace Drupal\silverback_gutenberg\Plugin\GutenbergBlockMutator;

use Drupal\silverback_gutenberg\Attribute\GutenbergBlockMutator;
use Drupal\silverback_gutenberg\BlockMutator\EntityBlockMutatorBase;
use Drupal\Core\StringTranslation\TranslatableMarkup;

#[GutenbergBlockMutator(
  id: "media_block_mutator",
  label: new TranslatableMarkup("Media IDs to UUIDs and viceversa."),
)]
class MediaBlockMutator extends EntityBlockMutatorBase {

  /**
   * {@inheritDoc}
   */
  public bool $isMultiple = TRUE;

  /**
   * {@inheritDoc}
   */
  public string $gutenbergAttribute = 'mediaEntityIds';

  /**
   * {@inheritDoc}
   */
  public string $entityTypeId = 'media';

}
