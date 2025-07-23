import { ClearCartMutation as ClearCartMutationId } from '@custom/schema';

import { defaultClient, type GraphQLClient } from '../client';
import { ClearCartMutation } from '../operations';
import type { Executor } from '../types';

export function createClearCartExecutor(
  client: GraphQLClient = defaultClient,
): Executor<typeof ClearCartMutationId> {
  return async (id: typeof ClearCartMutationId, vars) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await client.request(ClearCartMutation, vars as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return result as any;
  };
}

export const clearCartExecutor: Executor<typeof ClearCartMutationId> =
  createClearCartExecutor();
