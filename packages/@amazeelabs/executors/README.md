# @amazeelabs/executors

A registry that decouples React components from how GraphQL operations are
executed. Components request data by operation id; the surrounding app decides
whether that resolves to a static result or a fetch function.

## Usage

Register executors with `OperationExecutorsProvider`. An executor is either a
result object or a function `(id, variables) => Promise<result>`. Entries may be
restricted by `id` and by `variables` (a partial object or a predicate). Nested
providers append to the registry, and the last matching entry wins.

```tsx
import { OperationExecutorsProvider } from '@amazeelabs/executors';

<OperationExecutorsProvider
  executors={[
    // Fallback for any operation.
    { executor: drupalExecutor('/graphql') },
    // Static result for one operation and matching variables.
    { id: ViewPageQuery, variables: { pathname: '/' }, executor: data },
  ]}
>
  <Page />
</OperationExecutorsProvider>;
```

Consume them with the `Operation` component or the hooks:

```tsx
import { Operation } from '@amazeelabs/executors';

<Operation id={ViewPageQuery} variables={{ pathname: '/' }}>
  {(result) => (result.state === 'success' ? <Page {...result.data} /> : null)}
</Operation>;
```

- `useOperationExecutor(id, variables)` returns the matching executor.
- `useAllOperationExecutors(id, variables)` returns all matching executors.
- `<Operation all>` runs all matching executors and returns an array.
- `findExecutor` / `findExecutors` do the same lookup on a plain registry.

No match throws an `ExecutorRegistryError` listing the candidates.

The `react-server` export provides the same API for React Server Components,
storing the registry in a request-scoped `cache()` instead of context.

## Dependencies

- Depends on: `@amazeelabs/codegen-operation-ids` (operation id types).
- Used by: `packages/schema`, which re-exports it from `@custom/schema` for
  `packages/ui` (`Operation`, `useOperation`, `withOperation`, Storybook
  `ExecutorsDecorator`), `apps/website`, `apps/preview` and `apps/decap`.
