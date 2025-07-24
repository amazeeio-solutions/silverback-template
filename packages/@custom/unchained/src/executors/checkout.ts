import { CheckoutMutation as CheckoutMutationId } from '@custom/schema';

import { defaultClient, type GraphQLClient } from '../client';
import { CheckoutMutation } from '../operations';
import type { Executor } from '../types';

export function createCheckoutExecutor(
  client: GraphQLClient = defaultClient,
): Executor<typeof CheckoutMutationId> {
  return async (id: typeof CheckoutMutationId, vars) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = await client.request(CheckoutMutation, vars as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { data: data as any, error: null };
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { data: null as any, error: error as Error };
    }
  };
}

export const checkoutExecutor: Executor<typeof CheckoutMutationId> =
  createCheckoutExecutor();
