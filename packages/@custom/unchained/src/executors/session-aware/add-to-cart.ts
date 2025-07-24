import { AddToCartMutation as AddToCartMutationId } from '@custom/schema';

import { type GraphQLClient, UnchainedGraphQLClient } from '../../client';
import { AddToCartMutation } from '../../operations';
import type { Executor } from '../../types';

/**
 * Creates a session-aware add-to-cart executor that automatically handles guest login
 */
export function createSessionAwareAddToCartExecutor(
  client: GraphQLClient = new UnchainedGraphQLClient(),
): Executor<typeof AddToCartMutationId> {
  return async (id: typeof AddToCartMutationId, vars) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = await client.request(AddToCartMutation, vars as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { data: data as any, error: null };
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { data: null as any, error: error as Error };
    }
  };
}

/**
 * Default session-aware add-to-cart executor that automatically handles guest login
 */
export const sessionAwareAddToCartExecutor: Executor<
  typeof AddToCartMutationId
> = createSessionAwareAddToCartExecutor();
