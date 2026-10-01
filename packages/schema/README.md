# @custom/schema

The GraphQL schema and operations shared by Drupal, Gatsby and the frontends.
GraphQL Codegen turns them into TypeScript types, typed operation ids and a
persisted query map.

## Usage

- `src/schema.graphql`: the schema. Directives carry docblocks with
  `implementation(drupal): …` and `implementation(gatsby): …` lines that map
  them to resolvers. Gatsby resolvers live in `src/page.ts` and `src/image.ts`.
- `src/operations/*.gql`, `src/fragments/**/*.gql`: queries, mutations and
  fragments.
- `.graphqlrc.json`: schema and document paths, shared by `codegen.ts` and IDE
  plugins. It also loads `directives.gql` files from Drupal modules in
  `apps/cms/web/modules/{contrib,custom}`.

After changing the schema or operations, regenerate with `pnpm prep`, or keep
`pnpm watch` running. Running `pnpm turbo:prep` from the repo root also works.

`codegen.ts` generates:

| Output                       | Content                                                         |
| ---------------------------- | --------------------------------------------------------------- |
| `src/generated/index.ts`     | Schema and operation types, typed operation ids                 |
| `src/generated/source.ts`    | Schema types suffixed with `Source`, with required `__typename` |
| `build/schema.graphql`       | Full schema, directives included                                |
| `build/operations.json`      | Persisted query map (id to query, fragments inlined)            |
| `build/gatsby-autoload.mjs`  | Gatsby directive resolvers                                      |
| `build/drupal-autoload.json` | Drupal directive implementations                                |

Operation ids come from `@amazeelabs/codegen-operation-ids`. The scalars
`Markup`, `Url` and `ImageSource` map to `@amazeelabs/scalars`.

The main entry (`src/index.ts`) re-exports the generated code,
`@amazeelabs/scalars` and `@amazeelabs/executors`, so consumers import
everything from `@custom/schema`:

```ts
import { FrameQuery, Operation } from '@custom/schema';
```

Other exports: `@custom/schema/source`, `@custom/schema/operations` (the JSON
map) and `@custom/schema/gatsby-autoload`.

## Dependencies

Depends on:

- `@amazeelabs/scalars`, `@amazeelabs/executors`: re-exported.
- `@amazeelabs/codegen-operation-ids`: operation ids and query map.

Used by:

- `@custom/cms`: the Drupal GraphQL server (`main`) reads `src/schema.graphql`.
  `silverback_graphql_persisted` reads `build/operations.json`, set in
  `apps/cms/scaffold/settings.php.append.txt`. `apps/cms/gatsby-config.mjs` uses
  the Gatsby autoloader.
- `@custom/website`: `build/schema.graphql` (via `graphqlrc.yml`),
  `build/operations.json` for `@amazeelabs/gatsby-plugin-operations`, types and
  ids.
- `@custom/decap`: Gatsby autoloader, `source` types, operations map.
- `@custom/ui`, `@custom/preview`: types, operation ids and executors.
- `@custom/gutenberg_blocks`: its `gutenberg:generate` script reads
  `src/schema.graphql`.
