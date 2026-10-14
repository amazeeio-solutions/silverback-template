# @amazeelabs/codegen-operation-ids

A [GraphQL Codegen] plugin that generates typed operation ids for queries and
mutations, plus a persisted query map. Works with any request library or plain
`fetch`.

[graphql codegen]: https://www.the-guild.dev/graphql/codegen

## Usage

Ids have the form `<OperationName><Type>:<sha256>`, e.g. `LoadPageQuery:3f2…`.
The hash is computed from the operation with all fragments inlined.

### Query map

With a `.json` output file, the plugin produces a map of ids to query strings
that a GraphQL server can use to execute persisted queries.

```yaml
generated/map.json:
  documents:
    - ./graphql/**/*.gql
  plugins:
    - '@amazeelabs/codegen-operation-ids'
  config:
    fragments: inline
```

`fragments` controls how fragments end up in the stored query:

- `inline`: fragment spreads are replaced with inline fragments.
- `attach`: used fragment definitions are appended to the operation.
- not set: the operation is stored as is, without fragment definitions.

### Typed ids

Combined with `typescript` and `typescript-operations` in a `.ts` output file,
it exports one constant per operation. The value is the id, typed with the
operation's result and variables.

```yaml
generated/schema.ts:
  documents:
    - ./graphql/**/*.gql
  plugins:
    - typescript
    - typescript-operations
    - '@amazeelabs/codegen-operation-ids'
```

```ts
import type {
  AnyOperationId,
  OperationResult,
  OperationVariables,
} from '@amazeelabs/codegen-operation-ids';

function graphqlFetch<T extends AnyOperationId>(
  id: T,
  variables: OperationVariables<T>,
): Promise<OperationResult<T>> {
  return fetch('/graphql', {
    method: 'POST',
    body: JSON.stringify({ id, variables }),
  }).then((response) => response.json());
}
```

The generated file imports `OperationId` from this package, so it must be
resolvable wherever the generated code is type-checked.

## Dependencies

- Used by: `@amazeelabs/executors`, and `packages/schema` (`codegen.ts`
  generates `build/operations.json` for Drupal and the typed ids in
  `src/generated/index.ts`).
