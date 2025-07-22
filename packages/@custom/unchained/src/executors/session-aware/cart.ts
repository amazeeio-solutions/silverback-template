import { type GraphQLClient, UnchainedGraphQLClient } from '../../client';
import { CartQuery } from '../../operations';
import type { Executor } from '../../types';

/**
 * Creates a session-aware cart executor that automatically handles guest login
 */
export function createSessionAwareCartExecutor(
  client: GraphQLClient = new UnchainedGraphQLClient(),
): Executor<'Cart'> {
  return async (id: 'Cart', vars: {}) => {
    const result = await client.request(CartQuery, vars);
    return { data: result, error: null };
  };
}

/**
 * Default session-aware cart executor that automatically handles guest login
 */
export const sessionAwareCartExecutor = createSessionAwareCartExecutor();
