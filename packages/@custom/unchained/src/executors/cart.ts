import { CartQuery as CartQueryId } from '@custom/schema';

import { defaultClient, type GraphQLClient } from '../client';
import { CartQuery } from '../operations';
import type { Executor } from '../types';

export function createCartExecutor(
  client: GraphQLClient = defaultClient,
): Executor<typeof CartQueryId> {
  return async (id: typeof CartQueryId, vars) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await client.request(CartQuery, vars as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { data: result as any, error: null };
  };
}

export const cartExecutor: Executor<typeof CartQueryId> = createCartExecutor();
