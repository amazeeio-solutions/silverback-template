import { initGraphQLTada } from 'gql.tada';

import type { introspection } from './graphql-env.d.ts';

export const graphql = initGraphQLTada<{
  introspection: introspection;
  scalars: {
    ID: string;
    String: string;
    Boolean: boolean;
    Int: number;
    Float: number;
    DateTime: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    JSON: any;
  };
}>();

export type { FragmentOf, VariablesOf, ResultOf } from 'gql.tada';
export { readFragment } from 'gql.tada';
