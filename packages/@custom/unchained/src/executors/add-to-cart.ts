import { AddToCartMutation as AddToCartMutationId } from '@custom/schema';

import { defaultClient, type GraphQLClient } from '../client';
import { AddToCartMutation } from '../operations';
import type { Executor } from '../types';

export function createAddToCartExecutor(
  client: GraphQLClient = defaultClient,
): Executor<typeof AddToCartMutationId> {
  return async (id: typeof AddToCartMutationId, vars) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await client.request(AddToCartMutation, vars as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return result as any;
  };
}

export const addToCartExecutor: Executor<typeof AddToCartMutationId> =
  createAddToCartExecutor();
