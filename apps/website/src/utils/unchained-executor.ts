import {
  AddToCartMutation,
  AnyOperationId,
  CartQuery,
  CheckoutMutation,
  ClearCartMutation,
  OperationVariables,
  RemoveFromCartMutation,
  UpdateCartItemMutation,
} from '@custom/schema';
import {
  createAddToCartExecutor,
  createCartExecutor,
  createCheckoutExecutor,
  createClearCartExecutor,
  createRemoveFromCartExecutor,
  createUpdateCartItemExecutor,
  UnchainedGraphQLClient,
} from '@custom/unchained';

// Determine the Unchained API URL based on environment
function getUnchainedApiUrl(): string {
  // Check if we're in development mode based on SB_ENVIRONMENT
  const isDevelopment = process.env.GATSBY_UNCHAINED_DEV === 'true';

  if (isDevelopment) {
    // Use local development server
    return 'http://localhost:8080/graphql';
  } else {
    // Use production URL - this should be set in environment variables
    return (
      process.env.GATSBY_UNCHAINED_API_URL || 'https://kls.nöd.live/graphql'
    );
  }
}

// Create Unchained client with environment-based URL
const unchainedClient = new UnchainedGraphQLClient(getUnchainedApiUrl());

// Create individual executors
const cartExecutor = createCartExecutor(unchainedClient);
const addToCartExecutor = createAddToCartExecutor(unchainedClient);
const updateCartItemExecutor = createUpdateCartItemExecutor(unchainedClient);
const removeFromCartExecutor = createRemoveFromCartExecutor(unchainedClient);
const clearCartExecutor = createClearCartExecutor(unchainedClient);
const checkoutExecutor = createCheckoutExecutor(unchainedClient);

// Cart operation IDs that should be handled by Unchained
const CART_OPERATIONS = [
  CartQuery,
  AddToCartMutation,
  UpdateCartItemMutation,
  RemoveFromCartMutation,
  ClearCartMutation,
  CheckoutMutation,
] as const;

/**
 * Create an executor that routes cart operations to Unchained API
 * and falls back to Drupal for other operations.
 */
export function unchainedExecutor() {
  return async function <OperationId extends AnyOperationId>(
    id: OperationId,
    variables?: OperationVariables<OperationId>,
  ) {
    // Check if this is a cart operation
    console.log('unchained executor', { id, variables });

    if (CART_OPERATIONS.includes(id as (typeof CART_OPERATIONS)[number])) {
      // Route to appropriate Unchained executor
      switch (id) {
        case CartQuery:
          return cartExecutor(id, variables);
        case AddToCartMutation:
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return addToCartExecutor(id, variables as any);
        case UpdateCartItemMutation:
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return updateCartItemExecutor(id, variables as any);
        case RemoveFromCartMutation:
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return removeFromCartExecutor(id, variables as any);
        case ClearCartMutation:
          return clearCartExecutor(id, variables);
        case CheckoutMutation:
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return checkoutExecutor(id, variables as any);
        default:
          throw new Error(`Unknown cart operation: ${id}`);
      }
    }

    // For non-cart operations, return null to let other executors handle them
    return null;
  };
}
