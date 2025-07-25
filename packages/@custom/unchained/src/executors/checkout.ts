import { CheckoutMutation as CheckoutMutationId } from '@custom/schema';

import { defaultClient, type GraphQLClient } from '../client';
import { CheckoutMutation } from '../operations';
import type { Executor } from '../types';
import { handleGraphQLResponse, mapCheckoutResult, mapVariablesToGqlTada } from '../utils';

export function createCheckoutExecutor(
  client: GraphQLClient = defaultClient,
): Executor<typeof CheckoutMutationId> {
  return async (id: typeof CheckoutMutationId, vars) => {
    // Map schema variables to gql.tada variables
    const gqlTadaVars = mapVariablesToGqlTada(CheckoutMutation, vars);
    const response = await client.request(CheckoutMutation, gqlTadaVars);
    const data = handleGraphQLResponse(response);
    // Map gql.tada result to schema result type
    return mapCheckoutResult(data);
  };
}

export const checkoutExecutor: Executor<typeof CheckoutMutationId> =
  createCheckoutExecutor();
