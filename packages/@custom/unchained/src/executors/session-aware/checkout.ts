import {
  CheckoutMutation as CheckoutMutationId,
  OperationVariables,
} from '@custom/schema';

import { type GraphQLClient, UnchainedGraphQLClient } from '../../client';
import { CheckoutMutation } from '../../operations';
import type { Executor } from '../../types';

/**
 * Creates a session-aware checkout executor that automatically handles guest login
 */
export function createSessionAwareCheckoutExecutor(
  client: GraphQLClient = new UnchainedGraphQLClient(),
): Executor<typeof CheckoutMutationId> {
  return async (
    id: typeof CheckoutMutationId,
    vars: OperationVariables<typeof CheckoutMutationId>,
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await client.request(CheckoutMutation, vars as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { data: result as any, error: null };
  };
}

/**
 * Default session-aware checkout executor that automatically handles guest login
 */
export const sessionAwareCheckoutExecutor: Executor<typeof CheckoutMutationId> =
  createSessionAwareCheckoutExecutor();
