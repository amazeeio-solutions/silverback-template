# Various customizations (`custom`)

Site-specific Drupal behavior: GraphQL directives and services for
`@custom/schema`, editor UI tweaks, deploy tasks and German interface strings.

## Configuration

- `/admin/config/website-settings`: "Website settings" admin menu block.
- `NETLIFY_URL`: website URL of the hidden `/set-drupal-session` iframe that
  passes the editor session expiry to the website. Added to pages rendered in
  the default theme. Defaults to `http://127.0.0.1:8000`.
- `PUBLISHER_URL`, `PUBLISHER_OAUTH2_CLIENT_SECRET`, `PREVIEW_URL`,
  `PREVIEW_OAUTH2_CLIENT_SECRET`: required by the OAuth consumer deploy hooks
  outside `SB_ENVIRONMENT`.

## Usage

GraphQL directives from `directives.gql`, picked up by `@custom/schema`:

- `@loadByUUID(type, uuid, operation)`: loads an entity by UUID.
- `@resolveParent`: resolves the parent value.
- `@entityEditLink`: resolves an entity edit link.
- `@loadByVocabulary(bundle)`: loads the terms of a vocabulary.
- `@drupalTranslatedStrings`: resolves the translated interface strings.
- `@homeRoute(path)`: resolves the home page route.

`@custom/schema` also uses the `custom.menus` and `custom.webform` services
(`@menuTranslations`, `@webformIdToUrl`, `@createWebformSubmission`).

Deploy hooks (`custom.deploy.php`, run by `drush deploy`):

- Sets the `silverback_preview_link` default preview user, creating a `Preview`
  user with the `preview` role if needed.
- Creates the `publisher` and `preview` OAuth consumers.

Post-update hooks import `translations/de.po` and rename the `gatsby` string
context to `website`.

Other behavior:

- Moves moderation state, metatags and field groups into the Gutenberg sidebar
  (see `custom_heavy`).
- Rewrites Gutenberg links to document media to the file URL on output, and back
  to the media on save (for entity usage tracking).
- Removes volatile fields from default content exports and keeps exported path
  aliases by disabling pathauto on them.
- Redirects node pages requested in a language without a published translation
  to the latest draft translation or to the original language.
- Adds an `X-Robots-Tag: noindex, nofollow` header to all Drupal responses.
- Views fields `custom_node_revision_title` and `custom_usage_count`.
- Falls back to the node title when `field_seo_title` is empty in tokens.

`tests/` contains example Unit and Kernel tests.

## Dependencies

- Depends on: `silverback_gatsby`, `simple_oauth`, `consumers`, `serialization`;
  uses `silverback_gutenberg` and `webform`.
- Used by: `gutenberg_blocks` (`custom.media_links` service), `custom_heavy`.
