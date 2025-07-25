import { UpdateCartItemMutation as UpdateCartItemMutationId } from '@custom/schema';

import { defaultClient, type GraphQLClient } from '../client';
import { UpdateCartItemMutation } from '../operations';
import type { Executor } from '../types';
import { handleGraphQLResponse, mapUpdateCartItemResult, mapVariablesToGqlTada } from '../utils';

export function createUpdateCartItemExecutor(
  client: GraphQLClient = defaultClient,
): Executor<typeof UpdateCartItemMutationId> {
  return async (id: typeof UpdateCartItemMutationId, vars) => {
    // Map schema variables to gql.tada variables
    const gqlTadaVars = mapVariablesToGqlTada(UpdateCartItemMutation, vars);
    const response = await client.request(UpdateCartItemMutation, gqlTadaVars);
    const data = handleGraphQLResponse(response);
    // Map gql.tada result to schema result type
    return mapUpdateCartItemResult(data);
  };
}

export const updateCartItemExecutor: Executor<typeof UpdateCartItemMutationId> =
  createUpdateCartItemExecutor();
