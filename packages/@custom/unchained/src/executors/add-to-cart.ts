import { AddToCartMutation as AddToCartMutationId } from '@custom/schema';

import { defaultClient, type GraphQLClient } from '../client';
import { AddToCartMutation } from '../operations';
import type { Executor } from '../types';

export function createAddToCartExecutor(
  client: GraphQLClient = defaultClient,
): Executor<typeof AddToCartMutationId> {
  return async (id: typeof AddToCartMutationId, vars) => {
    console.log(id, vars);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = await client.request(AddToCartMutation, vars as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { data: data as any, error: null };
    } catch (error) {
      console.error(error);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { data: null as any, error: error as Error };
    }
  };
}

export const addToCartExecutor: Executor<typeof AddToCartMutationId> =
  createAddToCartExecutor();
