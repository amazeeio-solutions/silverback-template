# Silverback Gutenberg (`silverback_gutenberg`)

Adjusts the Drupal [Gutenberg](https://www.drupal.org/project/gutenberg) editor
for headless projects: GraphQL directives for blocks, link processing, block
validation, Linkit suggestions and ID/UUID mapping for default content.

## Setup / Configuration

- Enable the module. Editor tweaks are applied automatically (no text colors,
  font sizes, custom class names, alignment or fullscreen mode).
- `silverback_gutenberg.settings:local_hosts`: hosts treated as local in
  addition to the current one; absolute links to them are made relative.
- Block validation runs on the `body` field of node bundles with Gutenberg
  enabled.

## Usage

### GraphQL directives

Picked up by `graphql_directives` (see `directives.graphql`).

- `@resolveEditorBlocks(path, ignored, aggregated)`: parse the field at `path`
  into blocks. Consecutive blocks listed in `aggregated` (default
  `["core/paragraph"]`) are merged into one `core/paragraph` block. Blocks in
  `ignored` are dropped and their children spread in place; `core/group` is
  always ignored. Links are processed for the entity's language.
- `@resolveEditorBlockType`: block name, for resolving block unions.
- `@resolveEditorBlockMarkup`: inner HTML of a block.
- `@resolveEditorBlockAttribute(key, plainText)`: a block attribute. With
  `plainText` (default `true`), the value is trimmed and HTML entities are
  decoded.
- `@resolveEditorBlockMedia`: the media entity in `mediaEntityIds[0]`,
  translated and access-checked.
- `@resolveEditorBlockChildren`: inner blocks.

```graphql
type Page {
  content: [PageContent!]!
    @resolveEditorBlocks(
      path: "body.value"
      aggregated: ["core/paragraph", "core/list"]
    )
}

union PageContent @resolveEditorBlockType = BlockMarkup | BlockMedia

type BlockMarkup @type(id: "core/paragraph") {
  markup: Markup! @resolveEditorBlockMarkup
}

type BlockMedia @type(id: "drupalmedia/drupal-media-entity") {
  media: Media @resolveEditorBlockMedia
  caption: Markup @resolveEditorBlockAttribute(key: "caption")
}
```

Implement `hook_editor_blocks_alter(array &$blocks, EntityInterface $entity)` to
alter the parsed blocks.

### Link processing

`LinkProcessor` (service `Drupal\silverback_gutenberg\LinkProcessor`) rewrites
links in Gutenberg fields:

- inbound (node presave): aliases and language prefixes are removed and entity
  IDs replaced by UUIDs, e.g. `/de/meine-seite` is stored as `/node/{uuid}`.
- outbound (editor form, `@resolveEditorBlocks`, webform messages): UUIDs are
  turned back into aliases with the target language prefix, e.g. `/en/my-page`.

Custom resolvers that parse Gutenberg HTML must call
`processLinks($html, 'outbound', $language)` themselves.

Blocks that store links in attributes must implement
`hook_silverback_gutenberg_link_processor_block_attrs_alter()`. Further alter
hooks exist for single links and URLs (`..._inbound_link`, `..._outbound_link`,
`..._inbound_url`, `..._outbound_url`). See
[`silverback_gutenberg.api.php`](./silverback_gutenberg.api.php).

### Validation

Validator plugins go in `src/Plugin/Validation/GutenbergValidator` with the
`@GutenbergValidator` annotation. Field rules come from `GutenbergValidatorRule`
plugins; `required` and `email` are provided.

```php
/**
 * @GutenbergValidator(
 *   id = "my_block_validator",
 *   label = @Translation("My block validator")
 * )
 */
class MyBlockValidator extends GutenbergValidatorBase {

  use StringTranslationTrait;

  public function applies(array $block): bool {
    return $block['blockName'] === 'custom/my-block';
  }

  public function validatedFields(array $block = []): array {
    return [
      'email' => [
        'field_label' => $this->t('Email'),
        'rules' => ['required', 'email'],
      ],
    ];
  }

}
```

For block-level logic, override `validateContent(array $block = []): array` and
return `['is_valid' => FALSE, 'message' => '...']` on failure.

Use `GutenbergCardinalityValidatorTrait` to validate inner blocks:

```php
public function validateContent(array $block = []): array {
  return $this->validateCardinality($block, [
    [
      'blockName' => 'custom/teaser',
      'blockLabel' => $this->t('Teaser'),
      'min' => 1,
      'max' => GutenbergCardinalityValidatorInterface::CARDINALITY_UNLIMITED,
    ],
  ]);
}
```

To count inner blocks of any type, pass this instead:

```php
[
  'validationType' => GutenbergCardinalityValidatorInterface::CARDINALITY_ANY,
  'min' => 0,
  'max' => 1,
]
```

### Linkit

Enable `linkit` and create a profile with the machine name `gutenberg` to use it
for Gutenberg link suggestions. Another profile can be used by passing its
machine name as `subtype` in the link control's `suggestionsQuery`. The
`Silverback: Content` and `Silverback: Media` matchers sort results by match
position and show the matching translation when the label does not match.

### Block mutators (default content)

When `default_content` is enabled, entity IDs stored in block attributes are
exported as UUIDs and mapped back to IDs on import. Built-in mutators handle
`mediaEntityIds` (media), `nodeId` (node) and attributes ending in `Term`,
`Terms` or `TermId` (taxonomy terms). Add more by extending
`EntityBlockMutatorBase` in `src/Plugin/GutenbergBlockMutator`:

```php
#[GutenbergBlockMutator(
  id: "my_node_block_mutator",
  label: new TranslatableMarkup("Node IDs to UUIDs and vice versa."),
)]
class MyNodeBlockMutator extends EntityBlockMutatorBase {
  public bool $isMultiple = TRUE;
  public string $gutenbergAttribute = 'nodeIds';
  public string $entityTypeId = 'node';
}
```

### Other

- `silverback_gutenberg/base` library: exposes `silverbackGutenbergUtils`
  (`sanitizeText`, `setPlainTextAttribute`) for custom blocks.
- Media library dialogs use the block's media types as bundle IDs.
- Entity usage track plugins for linked, referenced and embedded content.

## Dependencies

- Depends on: `gutenberg` (>= 2.0-beta2). Uses `graphql` and
  `graphql_directives` for the directives.
- Optional: `linkit` (>= 7), `default_content`, `webform`, `entity_usage`.
- Used by: `silverback_iframe` (uses `LinkProcessor` for redirect URLs).
