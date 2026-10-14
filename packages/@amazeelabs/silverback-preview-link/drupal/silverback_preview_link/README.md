# Silverback Preview Link (`silverback_preview_link`)

Shareable, expiring preview links for a decoupled frontend. Editors generate a
token link (with a QR code) to the external preview of a node. The token
authenticates frontend requests as the preview user attached to the link.

Inspired by [Preview Link](https://www.drupal.org/project/preview_link), but
independent of it and limited to the decoupled use case.

## Setup / Configuration

Settings at `/admin/config/content/silverback_preview_link` (permission
`administer silverback preview link settings`):

- Enabled entity types/bundles (`enabled_entity_types`). If none is selected,
  all are enabled. Only revisionable entity types with a canonical route are
  listed. Links can only be generated for nodes.
- `expiry_seconds`: link lifetime, 86400 (1 day) by default.
- `multiple_entities`: whether a link can reference several entities.
- Default preview user (state `silverback_preview_link.default_preview_user`):
  added to every new link. Requests with the token are authenticated as this
  user (it must be active).

Editors with `generate silverback preview links` get a _Share preview_ form at
`<canonical path>/generate-preview-link`.

## Usage

- The link is the `silverback_external_preview` URL of the node, with a
  `preview_access_token` query parameter and no `rid`, so recipients always see
  the latest revision.
- `preview_token` authentication provider: a request with a valid, non-expired
  `?preview_access_token=` is authenticated as the active user referenced by the
  link. Page cache is disabled for these requests.
- `POST /preview/link-access` (JSON body `{"preview_access_token": "..."}`):
  returns `{"access": true}` (200) for a valid, non-expired token,
  otherwise 403.
- `POST /preview/access` (OAuth2): returns whether the token user has
  `use external preview`.
- Expired links are rejected at validation time and deleted on cron.

`apps/preview` calls both endpoints.

## Dependencies

- Depends on: `silverback_external_preview` (preview URL),
  `silverback_autosave`, `silverback_gatsby`, `dynamic_entity_reference`;
  composer: `chillerlan/php-qrcode`.
