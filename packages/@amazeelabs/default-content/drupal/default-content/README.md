# Default Content helpers (`amazeelabs/default-content`)

Composer package (not a Drupal module) with helpers to export and import all
content entities of a site through
[Default Content](https://www.drupal.org/project/default_content). It also ships
patches for `drupal/default_content`.

## Setup / Configuration

- Require `amazeelabs/default-content` and enable `default_content`.
- Set `"enable-patching": true` in the root `composer.json` so the bundled
  patches are applied.
- Content is stored in the `content` directory of the given module.

## Usage

Call the helpers from a script run with `drush php-script`:

```php
use AmazeeLabs\DefaultContent\Export;
use AmazeeLabs\DefaultContent\Import;

// Wipes <module>/content, then exports all content entities with references,
// except the excluded entity types and users 0 and 1.
Export::run('test_content', ['path_alias', 'redirect']);

// Imports <module>/content.
Import::run('test_content');

// Imports, then updates existing entities that differ from the export and
// deletes entities missing from it.
Import::runWithUpdate('test_content');
```

In the template, `pnpm content:export` and `pnpm content:import` in `apps/cms`
run `packages/drupal/test_content/export.php` and `import.php`.

## Dependencies

- Depends on: `drupal/default_content` (^2.0.0-beta1),
  `cweagans/composer-patches` (^1.7.3).
- Related: `silverback_gutenberg` overrides the `default_content` normalizer to
  map entity IDs in Gutenberg blocks to UUIDs.
