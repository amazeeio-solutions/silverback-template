import { type GraphQLClient, UnchainedGraphQLClient } from '../../client';
import { RemoveFromCartMutation } from '../../operations';
import type { Executor } from '../../types';

/**
 * Creates a session-aware remove-from-cart executor that automatically handles guest login
 */
export function createSessionAwareRemoveFromCartExecutor(
  client: GraphQLClient = new UnchainedGraphQLClient(),
): Executor<'RemoveFromCart'> {
  return async (id: 'RemoveFromCart', vars: { productId: string }) => {
    const result = await client.request(RemoveFromCartMutation, vars);
    return { data: result, error: null };
  };
}

/**
 * Default session-aware remove-from-cart executor that automatically handles guest login
 */
export const sessionAwareRemoveFromCartExecutor =
  createSessionAwareRemoveFromCartExecutor();
