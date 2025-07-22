# @custom/unchained

A TypeScript package for communicating with the Unchained GraphQL endpoint at
`https://kls.nöd.live/graphql`.

## Features

- Type-safe GraphQL operations using gql.tada
- Executor functions matching the Executor type from @custom/ui
- Support for ESM and CommonJS
- Full test coverage with Vitest and MSW

## Operations

- Cart management (query, add, update, remove, clear)
- Checkout processing

## Usage

```typescript
import { cartExecutor, addToCartExecutor } from '@custom/unchained';

// Use with the operation system
const cart = await cartExecutor('Cart', {});
```
