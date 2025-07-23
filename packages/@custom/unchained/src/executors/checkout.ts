import { CheckoutMutation as CheckoutMutationId } from '@custom/schema';

import { defaultClient, type GraphQLClient } from '../client';
import { CheckoutMutation } from '../operations';
import type { Executor } from '../types';

export function createCheckoutExecutor(
  client: GraphQLClient = defaultClient,
): Executor<typeof CheckoutMutationId> {
  return async (id: typeof CheckoutMutationId, vars) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await client.request(CheckoutMutation, vars as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { data: result as any, error: null };
  };
}

export const checkoutExecutor: Executor<typeof CheckoutMutationId> =
  createCheckoutExecutor();
