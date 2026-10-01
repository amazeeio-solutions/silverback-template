# Silverback Gatsby (`silverback_gatsby`)

GraphQL schema extension that prepares a `graphql_directives` schema for
[`@amazeelabs/gatsby-source-silverback`][gatsby-source-silverback]. It tracks
changes to the entities, menus and strings exposed in the schema (in the
`gatsby_update_log` table) and notifies the frontend through build and update
webhooks.

[gatsby-source-silverback]:
  https://www.npmjs.com/package/@amazeelabs/gatsby-source-silverback

## Setup / Configuration

Create a GraphQL server with the `Directable` schema plugin and enable the
_Silverback Gatsby_ extension. Then configure its _Build_ tab
(`/admin/config/graphql/servers/build/{server}`). The values are stored in the
server's `schema_configuration.<schema>`:

- `build_webhook`: receives `POST {"buildId": <id>}` when relevant content
  changes. Servers without it are not tracked.
- `update_webhook`: receives `POST [{"type": ..., "id": ...}]` with the changed
  objects (real-time updates).
- `build_url`: frontend URL. `<build_url>/build.json` (`drupalBuildId`) is
  checked to skip builds when the frontend is already up to date.
- `build_url_netlify_password`: password if `build_url` is Netlify protected.
- `user`: only changes visible to this user trigger notifications.
- `build_trigger_on_save`: trigger a build on entity save (on when unset).

They can be overridden in `settings.php`:

```php
$config['graphql.graphql_servers.main']['schema_configuration']['directable']['build_webhook'] = 'https://publisher.example.com/___status/build';
```

Set the `SB_SETUP` env var during site installation to silence errors about a
missing notification user.

Permissions: `trigger a gatsby build`, `access publisher`,
`view publisher status`, `fetch any autosaved entity`.

The module also:

- exposes `POST /publisher/access` (OAuth2), which tells whether the token user
  has `access publisher`;
- exposes `/silverback_gatsby/ajax/build`, which builds the first server with
  the extension enabled;
- copies `SLB-Forwarded-{Proto,Host,Port,For}` request headers to
  `X-Forwarded-*`, and ignores `X-Forwarded-*` when it builds the session name;
- sets a JS-readable `drupal_user` cookie on login when `cookie_domain` is
  configured.

## Usage

Type directives (feeds) that register a type for change tracking:

- `@entity(type: String!, bundle: String, access: Boolean)`: `access: false`
  skips Drupal access checks.
- `@menu(menu_id: String, menu_ids: [String!], max_level: Int)`: with
  `menu_ids`, the first menu the user can `view label` is used. `max_level`
  limits depth, so separate types can have separate cache buckets.
- `@translatableString(contextPrefix: String)` (`@stringTranslation` is
  deprecated).

Field directives:

- `@isPath`, `@isTemplate`: mark the fields Gatsby uses to create pages.
- `@fetchEntity(type, id, rid, language, operation, loadLatestRevision)`: loads
  an entity (or revision) and applies autosaved values when
  `silverback_autosave` is enabled.
- `@imageProps`, `@focalPoint`: image properties and focal point coordinates.

Generic resolvers (`@property`, `@entityPath`, `@menuItems`, `@menuItemId`, …)
come from `graphql_directives`. Example from the `silverback_gatsby_example`
submodule:

```graphql
type Page @entity(type: "node", bundle: "page") {
  path: String! @isPath @entityPath
  title: String! @property(path: "title.value")
}

type MenuItem {
  id: String! @menuItemId
  parent: String @menuItemParentId
  label: String! @menuItemLabel
  url: String! @menuItemUrl
}

type MainMenu @menu(menu_ids: ["access_denied", "main"]) {
  items: [MenuItem]! @menuItems
}
```

Menu trees are flattened. Rebuild them on the client from `id` and `parent`.

Drush:

```shell
# Build if the frontend is outdated (--force: always). Alias: sgb.
drush silverback-gatsby:build <server_id> [--force]
# Write <server>.composed.graphqls files (default folder: ../generated). Alias: sgse.
drush silverback-gatsby:schema-export [folder]
```

## Dependencies

- Depends on: `graphql` (>=4), `graphql_directives`.
- Optional: `silverback_autosave` (autosaved values in `@fetchEntity`),
  `entity_usage` (referencing entities get updates too), `locale` (string
  translation tracking, requires core patch
  [#2123543](https://www.drupal.org/node/2123543)).
- Used by: `silverback_preview_link`, `silverback_search` (reads
  `gatsby_update_log`), `@amazeelabs/publisher` (webhooks, `/publisher/access`).
