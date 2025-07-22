import { type GraphQLClient, UnchainedGraphQLClient } from '../../client';
import { AddToCartMutation } from '../../operations';
import type { Executor } from '../../types';

/**
 * Creates a session-aware add-to-cart executor that automatically handles guest login
 */
export function createSessionAwareAddToCartExecutor(
  client: GraphQLClient = new UnchainedGraphQLClient(),
): Executor<'AddToCart'> {
  return async (
    id: 'AddToCart',
    vars: { input: { productId: string; quantity?: number } },
  ) => {
    const result = await client.request(AddToCartMutation, vars);
    return { data: result, error: null };
  };
}

/**
 * Default session-aware add-to-cart executor that automatically handles guest login
 */
export const sessionAwareAddToCartExecutor =
  createSessionAwareAddToCartExecutor();
