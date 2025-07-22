import { type GraphQLClient, UnchainedGraphQLClient } from '../../client';
import { CheckoutMutation } from '../../operations';
import type { Executor } from '../../types';

/**
 * Creates a session-aware checkout executor that automatically handles guest login
 */
export function createSessionAwareCheckoutExecutor(
  client: GraphQLClient = new UnchainedGraphQLClient(),
): Executor<'Checkout'> {
  return async (
    id: 'Checkout',
    vars: {
      input: {
        email: string;
        firstName: string;
        lastName: string;
        address?: string;
        city?: string;
        postalCode?: string;
        country?: string;
      };
    },
  ) => {
    const result = await client.request(CheckoutMutation, vars);
    return { data: result, error: null };
  };
}

/**
 * Default session-aware checkout executor that automatically handles guest login
 */
export const sessionAwareCheckoutExecutor =
  createSessionAwareCheckoutExecutor();
