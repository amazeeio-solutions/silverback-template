import { defaultClient, type GraphQLClient } from '../client';
import { RemoveFromCartMutation } from '../operations';
import type { Executor } from '../types';

export function createRemoveFromCartExecutor(
  client: GraphQLClient = defaultClient,
): Executor<'RemoveFromCart'> {
  return async (id: 'RemoveFromCart', vars: { productId: string }) => {
    const result = await client.request(RemoveFromCartMutation, vars);
    return { data: result, error: null };
  };
}

export const removeFromCartExecutor = createRemoveFromCartExecutor();
