# Silverback autosave (`silverback_autosave`)

Periodically saves the state of content entity edit forms (built for Gutenberg
nodes) and notifies the preview app, so it can show unsaved changes in real
time. Based on [Autosave Form](https://www.drupal.org/project/autosave_form).

## Setup / Configuration

Settings at `/admin/config/content/silverback_autosave` (permission
`administer site configuration`):

- `interval`: autosave interval in ms (default 10000).
- `only_on_form_change`: only autosave when the form changed (experimental).
- `active_on.content_entity_forms`: enable on content entity forms.
- `allowed_content_entity_types`: restrict to entity types/bundles (all when
  empty).
- `notification`: show a notification (`active`, `message`, `delay` in ms).

`PREVIEW_URL` env var: base URL of the preview app. After each autosave of an
existing entity, the module sends `POST <PREVIEW_URL>/__preview` with
`{entity_type_id, entity_id, langcode}`. Default: `http://localhost:8001`.

Autosaved states are stored in the `silverback_autosave_entity_form` table. They
are purged when the entity is saved (only the current session if the `conflict`
module is enabled), and for a user when their roles change.

## Usage

Read autosaved values through the `silverback_autosave.entity_form_storage`
service, e.g.
`getEntityAndFormState($form_id, $entity_type_id, $entity_id, $langcode, $uid)`.

## Dependencies

- Depends on: `drupal:system`. Its JS library also depends on
  `gutenberg/edit-node` (Gutenberg contrib module).
- Optional: `conflict`.
- Used by: `silverback_gatsby` (`@fetchEntity` returns autosaved values),
  `silverback_preview_link`.
