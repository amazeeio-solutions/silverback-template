import { RemoveFromCartMutation as RemoveFromCartMutationId } from '@custom/schema';

import { defaultClient, type GraphQLClient } from '../client';
import { RemoveFromCartMutation } from '../operations';
import type { Executor } from '../types';
import { handleGraphQLResponse, mapRemoveFromCartResult, mapVariablesToGqlTada } from '../utils';

export function createRemoveFromCartExecutor(
  client: GraphQLClient = defaultClient,
): Executor<typeof RemoveFromCartMutationId> {
  return async (id: typeof RemoveFromCartMutationId, vars) => {
    // Map schema variables to gql.tada variables
    const gqlTadaVars = mapVariablesToGqlTada(RemoveFromCartMutation, vars);
    const response = await client.request(RemoveFromCartMutation, gqlTadaVars);
    const data = handleGraphQLResponse(response);
    // Map gql.tada result to schema result type
    return mapRemoveFromCartResult(data);
  };
}

export const removeFromCartExecutor: Executor<typeof RemoveFromCartMutationId> =
  createRemoveFromCartExecutor();
