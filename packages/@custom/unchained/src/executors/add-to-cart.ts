import { defaultClient, type GraphQLClient } from '../client';
import { AddToCartMutation } from '../operations';
import type { Executor } from '../types';

export function createAddToCartExecutor(
  client: GraphQLClient = defaultClient,
): Executor<'AddToCart'> {
  return async (
    id: 'AddToCart',
    vars: { input: { productId: string; quantity?: number } },
  ) => {
    const result = await client.request(AddToCartMutation, vars);
    return { data: result, error: null };
  };
}

export const addToCartExecutor = createAddToCartExecutor();
