import { defaultClient, type GraphQLClient } from '../client';
import { CartQuery } from '../operations';
import type { Executor } from '../types';

export function createCartExecutor(
  client: GraphQLClient = defaultClient,
): Executor<'Cart'> {
  return async (id: 'Cart', vars: {}) => {
    const result = await client.request(CartQuery, vars);
    return { data: result, error: null };
  };
}

export const cartExecutor = createCartExecutor();
