import { AnyOperationId, OperationVariables } from '@custom/schema';
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
  // Check if we're in development mode
  const isDevelopment = process.env.GATSBY_DEVELOPMENT === 'true';

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
// TODO: use operation-id's exported from @custom/schema instead of this.
const CART_OPERATIONS = [
  'Cart',
  'AddToCart',
  'UpdateCartItem',
  'RemoveFromCart',
  'ClearCart',
  'Checkout',
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
    const operationName = id.split(':')[0];
    console.log('unchained executor', { id, variables });

    if (
      CART_OPERATIONS.includes(
        operationName as (typeof CART_OPERATIONS)[number],
      )
    ) {
      // Route to appropriate Unchained executor
      switch (operationName) {
        case 'Cart':
          return cartExecutor(id as 'Cart', variables);
        case 'AddToCart':
          return addToCartExecutor(id as 'AddToCart', variables);
        case 'UpdateCartItem':
          return updateCartItemExecutor(id as 'UpdateCartItem', variables);
        case 'RemoveFromCart':
          return removeFromCartExecutor(id as 'RemoveFromCart', variables);
        case 'ClearCart':
          return clearCartExecutor(id as 'ClearCart', variables);
        case 'Checkout':
          return checkoutExecutor(id as 'Checkout', variables);
        default:
          throw new Error(`Unknown cart operation: ${operationName}`);
      }
    }

    // For non-cart operations, return null to let other executors handle them
    return null;
  };
}

