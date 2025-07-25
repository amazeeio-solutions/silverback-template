import { CartQuery as CartQueryId } from '@custom/schema';

import { defaultClient, type GraphQLClient } from '../client';
import { CartQuery } from '../operations';
import type { Executor } from '../types';
import { handleGraphQLResponse, mapCartResult } from '../utils';

export function createCartExecutor(
  client: GraphQLClient = defaultClient,
): Executor<typeof CartQueryId> {
  return async (id: typeof CartQueryId, vars) => {
    // Cart query has no variables, pass empty object if vars is undefined
    const response = await client.request(CartQuery, vars || {});
    const data = handleGraphQLResponse(response);
    // Map gql.tada result to schema result type
    return mapCartResult(data);
  };
}

export const cartExecutor: Executor<typeof CartQueryId> = createCartExecutor();
