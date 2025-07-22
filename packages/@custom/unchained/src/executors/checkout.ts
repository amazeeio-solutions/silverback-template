import { defaultClient, type GraphQLClient } from '../client';
import { CheckoutMutation } from '../operations';
import type { Executor } from '../types';

export function createCheckoutExecutor(
  client: GraphQLClient = defaultClient,
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

export const checkoutExecutor = createCheckoutExecutor();
