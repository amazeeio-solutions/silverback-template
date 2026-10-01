# Search API Global (`search_api_global`)

Adds content search to the Coffee admin search box. The `/global-search` route
returns Coffee commands built from the `global_search_embed` display of the
`global_search` view, which queries the `global_search` Search API index.

## Usage

```
/global-search?search=<keywords>
```

Requires the `access coffee` permission. The Coffee JavaScript calls this route
through the `on_the_fly_ajax_search_poc.patch` applied to `drupal/coffee` in
`apps/cms/composer.json`.

## Dependencies

- Depends on: `search_api`, `coffee` (patched), `views`; the `global_search`
  view and index configuration.
