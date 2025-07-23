import {
  OperationVariables,
  RemoveFromCartMutation as RemoveFromCartMutationId,
} from '@custom/schema';

import { type GraphQLClient, UnchainedGraphQLClient } from '../../client';
import { RemoveFromCartMutation } from '../../operations';
import type { Executor } from '../../types';

/**
 * Creates a session-aware remove-from-cart executor that automatically handles guest login
 */
export function createSessionAwareRemoveFromCartExecutor(
  client: GraphQLClient = new UnchainedGraphQLClient(),
): Executor<typeof RemoveFromCartMutationId> {
  return async (
    id: typeof RemoveFromCartMutationId,
    vars: OperationVariables<typeof RemoveFromCartMutationId>,
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await client.request(RemoveFromCartMutation, vars as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return result as any;
  };
}

/**
 * Default session-aware remove-from-cart executor that automatically handles guest login
 */
export const sessionAwareRemoveFromCartExecutor: Executor<
  typeof RemoveFromCartMutationId
> = createSessionAwareRemoveFromCartExecutor();
