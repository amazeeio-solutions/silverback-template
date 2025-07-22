import { type GraphQLClient, UnchainedGraphQLClient } from '../../client';
import { UpdateCartItemMutation } from '../../operations';
import type { Executor } from '../../types';

/**
 * Creates a session-aware update-cart-item executor that automatically handles guest login
 */
export function createSessionAwareUpdateCartItemExecutor(
  client: GraphQLClient = new UnchainedGraphQLClient(),
): Executor<'UpdateCartItem'> {
  return async (
    id: 'UpdateCartItem',
    vars: { input: { itemId: string; quantity: number } },
  ) => {
    const result = await client.request(UpdateCartItemMutation, vars);
    return { data: result, error: null };
  };
}

/**
 * Default session-aware update-cart-item executor that automatically handles guest login
 */
export const sessionAwareUpdateCartItemExecutor =
  createSessionAwareUpdateCartItemExecutor();
