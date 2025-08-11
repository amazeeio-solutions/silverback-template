import { CheckoutMutation as CheckoutMutationId } from '@custom/schema';

import { defaultClient, type GraphQLClient } from '../client';
import { CheckoutMutation, SignPaymentProviderForCheckoutMutation, UpdateCartMutation } from '../operations';
import type { Executor } from '../types';
import {
  handleGraphQLResponse,
  mapCheckoutResult,
  mapSignPaymentProviderResult,
  mapVariablesToGqlTada,
} from '../utils';

export function createCheckoutExecutor(
  client: GraphQLClient = defaultClient,
): Executor<typeof CheckoutMutationId> {
  return async (id: typeof CheckoutMutationId, vars) => {
    // First, update the cart with billing address and contact information
    const updateCartVars = mapVariablesToGqlTada(UpdateCartMutation, vars);
    const updateResponse = await client.request(UpdateCartMutation, updateCartVars);
    const updateData = handleGraphQLResponse(updateResponse);

    // Extract cart information from the update response
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cartData = updateData.updateCart as any;
    const totalAmount = cartData?.total ? cartData.total.amount / 100 : 0; // Convert from cents to dollars
    const paymentProvider = cartData?.payment?.provider;
    const paymentProviderId = paymentProvider?._id;
    const paymentProviderType = paymentProvider?.type;
    
    if (totalAmount > 0 && paymentProviderType === 'GENERIC') {
      // GENERIC provider flow - for paid checkouts
      // Use sign payment provider for checkout
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const input = vars.input as any; // Type assertion for redirect URLs
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const hostname = typeof globalThis !== 'undefined' && (globalThis as any).window ? (globalThis as any).window.location.hostname : 'localhost:3000';
      const transactionContext = {
        successRedirectUrl: input.successRedirectUrl || `https://${hostname}/en/checkout/success`,
        cancelRedirectUrl: input.cancelRedirectUrl || `https://${hostname}/en/checkout/cancelled`,
        failedRedirectUrl: input.failedRedirectUrl || `https://${hostname}/en/checkout/failed`,
      };

      const signResponse = await client.request(SignPaymentProviderForCheckoutMutation, {
        transactionContext,
      });
      const signData = handleGraphQLResponse(signResponse);
      return mapSignPaymentProviderResult(signData);
    } else {
      // INVOICE provider flow - for free checkouts or non-generic providers
      // Proceed with direct checkout, including payment provider info
      const checkoutVars = mapVariablesToGqlTada(CheckoutMutation, {
        ...vars,
        paymentProviderId,
        paymentProviderType,
      });
      const response = await client.request(CheckoutMutation, checkoutVars);
      const data = handleGraphQLResponse(response);
      return mapCheckoutResult(data);
    }
  };
}

export const checkoutExecutor: Executor<typeof CheckoutMutationId> =
  createCheckoutExecutor();
