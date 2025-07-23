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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await client.request(AddToCartMutation, vars as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { data: result as any, error: null };
  };
}

/**
 * Default session-aware add-to-cart executor that automatically handles guest login
 */
export const sessionAwareAddToCartExecutor: Executor<
  typeof AddToCartMutationId
> = createSessionAwareAddToCartExecutor();
