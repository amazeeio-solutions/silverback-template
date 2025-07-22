import { defaultClient, type GraphQLClient } from '../client';
import { UpdateCartItemMutation } from '../operations';
import type { Executor } from '../types';

export function createUpdateCartItemExecutor(
  client: GraphQLClient = defaultClient,
): Executor<'UpdateCartItem'> {
  return async (
    id: 'UpdateCartItem',
    vars: { input: { itemId: string; quantity: number } },
  ) => {
    const result = await client.request(UpdateCartItemMutation, vars);
    return { data: result, error: null };
  };
}

export const updateCartItemExecutor = createUpdateCartItemExecutor();
