import { RemoveFromCartMutation as RemoveFromCartMutationId } from '@custom/schema';

import { defaultClient, type GraphQLClient } from '../client';
import { RemoveFromCartMutation } from '../operations';
import type { Executor } from '../types';

export function createRemoveFromCartExecutor(
  client: GraphQLClient = defaultClient,
): Executor<typeof RemoveFromCartMutationId> {
  return async (id: typeof RemoveFromCartMutationId, vars) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await client.request(RemoveFromCartMutation, vars as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { data: result as any, error: null };
  };
}

export const removeFromCartExecutor: Executor<typeof RemoveFromCartMutationId> =
  createRemoveFromCartExecutor();
