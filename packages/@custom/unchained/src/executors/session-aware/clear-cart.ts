import { type GraphQLClient, UnchainedGraphQLClient } from '../../client';
import { ClearCartMutation } from '../../operations';
import type { Executor } from '../../types';

/**
 * Creates a session-aware clear-cart executor that automatically handles guest login
 */
export function createSessionAwareClearCartExecutor(
  client: GraphQLClient = new UnchainedGraphQLClient(),
): Executor<'ClearCart'> {
  return async (id: 'ClearCart', vars: {}) => {
    const result = await client.request(ClearCartMutation, vars);
    return { data: result, error: null };
  };
}

/**
 * Default session-aware clear-cart executor that automatically handles guest login
 */
export const sessionAwareClearCartExecutor =
  createSessionAwareClearCartExecutor();
