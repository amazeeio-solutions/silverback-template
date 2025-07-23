import {
  OperationVariables,
  UpdateCartItemMutation as UpdateCartItemMutationId,
} from '@custom/schema';

import { type GraphQLClient, UnchainedGraphQLClient } from '../../client';
import { UpdateCartItemMutation } from '../../operations';
import type { Executor } from '../../types';

/**
 * Creates a session-aware update-cart-item executor that automatically handles guest login
 */
export function createSessionAwareUpdateCartItemExecutor(
  client: GraphQLClient = new UnchainedGraphQLClient(),
): Executor<typeof UpdateCartItemMutationId> {
  return async (
    id: typeof UpdateCartItemMutationId,
    vars: OperationVariables<typeof UpdateCartItemMutationId>,
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await client.request(UpdateCartItemMutation, vars as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return result as any;
  };
}

/**
 * Default session-aware update-cart-item executor that automatically handles guest login
 */
export const sessionAwareUpdateCartItemExecutor: Executor<
  typeof UpdateCartItemMutationId
> = createSessionAwareUpdateCartItemExecutor();
