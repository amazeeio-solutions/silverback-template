import { CartQuery as CartQueryId } from '@custom/schema';

import { type GraphQLClient, UnchainedGraphQLClient } from '../../client';
import { CartQuery } from '../../operations';
import type { Executor } from '../../types';

/**
 * Creates a session-aware cart executor that automatically handles guest login
 */
export function createSessionAwareCartExecutor(
  client: GraphQLClient = new UnchainedGraphQLClient(),
): Executor<typeof CartQueryId> {
  return async (id: typeof CartQueryId, vars) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await client.request(CartQuery, vars as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { data: result as any, error: null };
  };
}

/**
 * Default session-aware cart executor that automatically handles guest login
 */
export const sessionAwareCartExecutor: Executor<typeof CartQueryId> =
  createSessionAwareCartExecutor();
