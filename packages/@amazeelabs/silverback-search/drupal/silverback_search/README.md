# Silverback Search (`silverback_search`)

Search API processor that indexes the HTML rendered by the decoupled frontend.
For each item it fetches the entity's live URL and adds the filtered markup to
the index.

## Setup / Configuration

Add the _Remote rendered HTML output (Silverback)_ field
(`silverback_remote_rendered_item`) to a Search API index and configure it:

- `root_selector`: CSS selector of the indexed root (default `#main-content`).
- `exclude_selector`: CSS selector of elements to drop (default
  `.visuallyhidden`).
- `netlify_password`: used when the frontend is Netlify password protected.
- `entity_types`: content entity types to process.

The live URL and base URL come from `silverback_external_preview` (`live_host`).
Indexing then works as follows:

- Redirects to another host are not followed. The item is indexed empty.
- The 404 page (`config_pages` `website_settings.field_404_page`) is indexed
  empty.
- If `gatsby_update_log` has changes newer than `drupalBuildId` in
  `<live_host>/build.json`, the item gets an "outdated" warning.
- With the `SB_SETUP` env var set, no values are added (the frontend is not
  available during site setup).

## Usage

Alter or skip the fetched URL:

```php
function hook_silverback_search_live_url_alter(string &$liveUrl, \Drupal\Core\Entity\ContentEntityInterface $entity) {
  if (str_contains($liveUrl, '/special-case')) {
    $liveUrl = 'skip';
  }
}
```

## Dependencies

- Depends on: `silverback_external_preview`; `search_api` (not declared);
  composer: `symfony/dom-crawler`, `symfony/css-selector`.
- Optional: `silverback_gatsby` (`gatsby_update_log` for outdated detection),
  `config_pages` (404 page).
