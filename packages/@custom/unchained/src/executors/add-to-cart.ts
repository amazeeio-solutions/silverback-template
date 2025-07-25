import { AddToCartMutation as AddToCartMutationId } from '@custom/schema';

import { defaultClient, type GraphQLClient } from '../client';
import { AddToCartMutation } from '../operations';
import type { Executor } from '../types';
import { handleGraphQLResponse, mapAddToCartResult, mapVariablesToGqlTada } from '../utils';

export function createAddToCartExecutor(
  client: GraphQLClient = defaultClient,
): Executor<typeof AddToCartMutationId> {
  return async (id: typeof AddToCartMutationId, vars) => {
    // Map schema variables to gql.tada variables
    const gqlTadaVars = mapVariablesToGqlTada(AddToCartMutation, vars);
    const response = await client.request(AddToCartMutation, gqlTadaVars);
    const data = handleGraphQLResponse(response);
    // Map gql.tada result to schema result type
    return mapAddToCartResult(data);
  };
}

export const addToCartExecutor: Executor<typeof AddToCartMutationId> =
  createAddToCartExecutor();
