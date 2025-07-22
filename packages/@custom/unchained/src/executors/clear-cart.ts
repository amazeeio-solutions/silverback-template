import { defaultClient, type GraphQLClient } from '../client';
import { ClearCartMutation } from '../operations';
import type { Executor } from '../types';

export function createClearCartExecutor(
  client: GraphQLClient = defaultClient,
): Executor<'ClearCart'> {
  return async (id: 'ClearCart', vars: {}) => {
    const result = await client.request(ClearCartMutation, vars);
    return { data: result, error: null };
  };
}

export const clearCartExecutor = createClearCartExecutor();
