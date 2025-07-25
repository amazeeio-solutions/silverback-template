import { ClearCartMutation as ClearCartMutationId } from '@custom/schema';

import { defaultClient, type GraphQLClient } from '../client';
import { ClearCartMutation } from '../operations';
import type { Executor } from '../types';
import { handleGraphQLResponse, mapClearCartResult } from '../utils';

export function createClearCartExecutor(
  client: GraphQLClient = defaultClient,
): Executor<typeof ClearCartMutationId> {
  return async (id: typeof ClearCartMutationId, vars) => {
    // Clear cart mutation has no variables, pass empty object if vars is undefined
    const response = await client.request(ClearCartMutation, vars || {});
    const data = handleGraphQLResponse(response);
    // Map gql.tada result to schema result type
    return mapClearCartResult(data);
  };
}

export const clearCartExecutor: Executor<typeof ClearCartMutationId> =
  createClearCartExecutor();
