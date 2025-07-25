import type { 
  AddToCartMutation as AddToCartMutationType,
  CartQuery as CartQueryType,
  CheckoutMutation as CheckoutMutationType,
  ClearCartMutation as ClearCartMutationType,
  ImageSource,
  RemoveFromCartMutation as RemoveFromCartMutationType,
  UpdateCartItemMutation as UpdateCartItemMutationType,
} from '@custom/schema';
import type { ResultOf,VariablesOf } from 'gql.tada';
import type { DocumentNode } from 'graphql';

import type { GraphQLResponse } from './client';
import {
  AddToCartMutation,
  CartQuery,
  CheckoutMutation,
  ClearCartMutation,
  GuestLoginMutation,
  RemoveFromCartMutation,
  UpdateCartItemMutation,
} from './operations';

/**
 * Helper function to handle GraphQL responses by extracting data or throwing errors
 * @param response The GraphQL response containing data and error
 * @returns The data from the response
 * @throws The error if one exists in the response
 */
export function handleGraphQLResponse<T>(response: GraphQLResponse<T>): T {
  if (response.error) {
    throw response.error;
  }
  return response.data;
}

/**
 * Helper to convert nullable string to non-null string (throwing if null)
 */
function assertNonNull<T>(value: T | null | undefined, fieldName: string): T {
  if (value === null || value === undefined) {
    throw new Error(`Expected non-null value for field: ${fieldName}`);
  }
  return value;
}

/**
 * Maps schema variables to gql.tada variables for operations where they differ
 */
export function mapVariablesToGqlTada<T extends DocumentNode>(
  operation: T,
  schemaVars: unknown,
): VariablesOf<T> {
  // Handle UpdateCartItemMutation variable mapping
  if (operation === UpdateCartItemMutation) {
    const updateVars = schemaVars as { input: { productId: string; quantity: number } };
    return {
      input: {
        itemId: updateVars.input.productId, // Map productId to itemId
        quantity: updateVars.input.quantity,
      },
    } as VariablesOf<T>;
  }

  // For most operations, variables have the same structure
  return schemaVars as VariablesOf<T>;
}

// Type aliases using actual gql.tada types
type GqlTadaAddToCartResult = ResultOf<typeof AddToCartMutation>;
type GqlTadaCartResult = ResultOf<typeof CartQuery>;
type GqlTadaUpdateCartItemResult = ResultOf<typeof UpdateCartItemMutation>;
type GqlTadaRemoveFromCartResult = ResultOf<typeof RemoveFromCartMutation>;
type GqlTadaClearCartResult = ResultOf<typeof ClearCartMutation>;
type GqlTadaCheckoutResult = ResultOf<typeof CheckoutMutation>;
type GqlTadaGuestLoginResult = ResultOf<typeof GuestLoginMutation>;

// Extract type helpers for cleaner code
type SchemaCartItem = NonNullable<CartQueryType['cart']>['items'][number];
type SchemaCart = NonNullable<CartQueryType['cart']>;
type GqlTadaCart = NonNullable<GqlTadaCartResult['cart']>;
type GqlTadaCartItem = NonNullable<GqlTadaCart['items']>[number];

/**
 * Maps gql.tada cart item result to schema cart item type
 */
function mapCartItem(item: NonNullable<GqlTadaCartItem>): SchemaCartItem {
  return {
    id: assertNonNull(item.id, 'item.id'),
    title: assertNonNull(item.title, 'item.title'),
    price: assertNonNull(item.price, 'item.price'),
    quantity: assertNonNull(item.quantity, 'item.quantity'),
    sku: assertNonNull(item.sku, 'item.sku'),
    maxStock: assertNonNull(item.maxStock, 'item.maxStock'),
    teaserImage: item.teaserImage
      ? {
          alt: assertNonNull(item.teaserImage.alt, 'item.teaserImage.alt'),
          source: assertNonNull(item.teaserImage.source, 'item.teaserImage.source') as ImageSource,
        }
      : undefined,
  };
}

/**
 * Maps gql.tada cart result to schema cart type
 */
function mapCart(cart: GqlTadaCart): SchemaCart {
  if (!cart) {
    throw new Error('Cart data is null');
  }
  
  return {
    totalItems: assertNonNull(cart.totalItems, 'cart.totalItems'),
    totalPrice: assertNonNull(cart.totalPrice, 'cart.totalPrice'),
    items: cart.items ? cart.items.filter((item): item is NonNullable<GqlTadaCartItem> => item !== null).map(mapCartItem) : [],
  };
}

// Extract error types for mapping
type SchemaError = { message: string };
type GqlTadaError = NonNullable<NonNullable<GqlTadaAddToCartResult['addToCart']>['errors']>[number];

/**
 * Maps gql.tada error result to schema error type
 */
function mapErrors(errors: (GqlTadaError | null)[]): SchemaError[] {
  return errors
    .filter((error): error is NonNullable<GqlTadaError> => error !== null)
    .map(error => ({
      message: assertNonNull(error.message, 'error.message'),
    }));
}

/**
 * Maps gql.tada AddToCart result to schema AddToCartMutation type
 */
export function mapAddToCartResult(data: GqlTadaAddToCartResult): AddToCartMutationType {
  if (!data.addToCart) {
    return { addToCart: undefined };
  }

  return {
    addToCart: {
      cart: data.addToCart.cart ? mapCart(data.addToCart.cart) : undefined,
      errors: data.addToCart.errors ? mapErrors(data.addToCart.errors) : undefined,
    },
  };
}

/**
 * Maps gql.tada Cart result to schema CartQuery type
 */
export function mapCartResult(data: GqlTadaCartResult): CartQueryType {
  // If cart is null, return empty cart structure to match schema expectations
  if (!data.cart) {
    return {
      cart: {
        totalItems: 0,
        totalPrice: 0,
        items: [],
      },
    };
  }
  
  return {
    cart: mapCart(data.cart),
  };
}

/**
 * Maps gql.tada UpdateCartItem result to schema UpdateCartItemMutation type
 */
export function mapUpdateCartItemResult(data: GqlTadaUpdateCartItemResult): UpdateCartItemMutationType {
  if (!data.updateCartItem) {
    return { updateCartItem: undefined };
  }

  return {
    updateCartItem: {
      cart: data.updateCartItem.cart ? mapCart(data.updateCartItem.cart) : undefined,
      errors: data.updateCartItem.errors ? mapErrors(data.updateCartItem.errors) : undefined,
    },
  };
}

/**
 * Maps gql.tada RemoveFromCart result to schema RemoveFromCartMutation type
 */
export function mapRemoveFromCartResult(data: GqlTadaRemoveFromCartResult): RemoveFromCartMutationType {
  if (!data.removeFromCart) {
    return { removeFromCart: undefined };
  }

  return {
    removeFromCart: {
      cart: data.removeFromCart.cart ? mapCart(data.removeFromCart.cart) : undefined,
      errors: data.removeFromCart.errors ? mapErrors(data.removeFromCart.errors) : undefined,
    },
  };
}

/**
 * Maps gql.tada ClearCart result to schema ClearCartMutation type
 */
export function mapClearCartResult(data: GqlTadaClearCartResult): ClearCartMutationType {
  if (!data.clearCart) {
    return { clearCart: undefined };
  }

  return {
    clearCart: {
      cart: data.clearCart.cart ? mapCart(data.clearCart.cart) : undefined,
      errors: data.clearCart.errors ? mapErrors(data.clearCart.errors) : undefined,
    },
  };
}

/**
 * Maps gql.tada Checkout result to schema CheckoutMutation type
 */
// Extract checkout-specific types
type SchemaOrderItem = NonNullable<NonNullable<CheckoutMutationType['checkout']>['order']>['items'][number];
type GqlTadaOrder = NonNullable<GqlTadaCheckoutResult['checkout']>['order'];
type GqlTadaOrderItem = NonNullable<NonNullable<GqlTadaOrder>['items']>[number];

function mapOrderItem(item: NonNullable<GqlTadaOrderItem>): SchemaOrderItem {
  return {
    id: assertNonNull(item.id, 'order.item.id'),
    title: assertNonNull(item.title, 'order.item.title'),
    price: assertNonNull(item.price, 'order.item.price'),
    quantity: assertNonNull(item.quantity, 'order.item.quantity'),
    sku: assertNonNull(item.sku, 'order.item.sku'),
  };
}

export function mapCheckoutResult(data: GqlTadaCheckoutResult): CheckoutMutationType {
  if (!data.checkout) {
    return { checkout: undefined };
  }

  const orderItems = data.checkout.order?.items 
    ? data.checkout.order.items.filter((item): item is NonNullable<GqlTadaOrderItem> => item !== null).map(mapOrderItem)
    : [];

  return {
    checkout: {
      order: data.checkout.order ? {
        id: assertNonNull(data.checkout.order.id, 'order.id'),
        orderNumber: assertNonNull(data.checkout.order.orderNumber, 'order.orderNumber'),
        status: assertNonNull(data.checkout.order.status, 'order.status'),
        totalAmount: assertNonNull(data.checkout.order.totalAmount, 'order.totalAmount'),
        items: orderItems,
      } : undefined,
      errors: data.checkout.errors ? mapErrors(data.checkout.errors) : undefined,
      paymentRedirectUrl: data.checkout.paymentRedirectUrl || undefined,
    },
  };
}

// Guest login return type (not yet in schema)
export type GuestLoginResult = {
  loginAsGuest?: {
    _id: string;
    tokenExpires?: string;
  };
};

/**
 * Maps gql.tada GuestLogin result to a simplified result type
 * Since GuestLogin is not yet in the schema, we use a basic structure
 */
export function mapGuestLoginResult(data: GqlTadaGuestLoginResult): GuestLoginResult {
  const loginData = data.loginAsGuest;
  if (!loginData) {
    return { loginAsGuest: undefined };
  }

  // Since the gql.tada type might not have the right structure, we need to cast it
  const typedLoginData = loginData as { _id: string | null; tokenExpires?: string | null };
  
  return {
    loginAsGuest: {
      _id: assertNonNull(typedLoginData._id, 'loginAsGuest._id'),
      tokenExpires: typedLoginData.tokenExpires || undefined,
    },
  };
}