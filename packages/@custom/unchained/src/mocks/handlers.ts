import type { ResultOf } from 'gql.tada';
import { graphql as mswGraphql, HttpResponse } from 'msw';

import {
  AddToCartMutation,
  CartQuery,
  CheckoutMutation,
  ClearCartMutation,
  GuestLoginMutation,
  RemoveFromCartMutation,
  UpdateCartItemMutation,
} from '../operations';

// Define types using gql.tada for type-safe mock responses
type CartQueryResult = ResultOf<typeof CartQuery>;
type AddToCartMutationResult = ResultOf<typeof AddToCartMutation>;
type UpdateCartItemMutationResult = ResultOf<typeof UpdateCartItemMutation>;
type RemoveFromCartMutationResult = ResultOf<typeof RemoveFromCartMutation>;
type ClearCartMutationResult = ResultOf<typeof ClearCartMutation>;
type CheckoutMutationResult = ResultOf<typeof CheckoutMutation>;
type GuestLoginMutationResult = ResultOf<typeof GuestLoginMutation>;

// These handlers mock the Unchained Commerce API for unit tests
// They should NOT mock external Drupal endpoints - those are mocked in drupal-handlers.ts
export const handlers = [
  mswGraphql.query('Cart', () => {
    const data: CartQueryResult = {
      cart: {
        items: [
          {
            id: '1',
            title: 'Test Product',
            price: 29.99,
            quantity: 2,
            sku: 'TEST-001',
            teaserImage: {
              alt: 'Test Product Image',
              source: 'https://example.com/test.jpg',
            },
            maxStock: 10,
          },
        ],
        totalItems: 2,
        totalPrice: 59.98,
      },
    };
    return HttpResponse.json({ data });
  }),

  mswGraphql.mutation('AddToCart', () => {
    const data: AddToCartMutationResult = {
      addToCart: {
        cart: {
          items: [
            {
              id: '1',
              title: 'Test Product',
              price: 29.99,
              quantity: 3,
              sku: 'TEST-001',
              teaserImage: {
                alt: 'Test Product Image',
                source: 'https://example.com/test.jpg',
              },
              maxStock: 10,
            },
          ],
          totalItems: 3,
          totalPrice: 89.97,
        },
        errors: [],
      },
    };
    return HttpResponse.json({ data });
  }),

  mswGraphql.mutation('UpdateCartItem', () => {
    const data: UpdateCartItemMutationResult = {
      updateCartItem: {
        cart: {
          items: [
            {
              id: '1',
              title: 'Test Product',
              price: 29.99,
              quantity: 1,
              sku: 'TEST-001',
              teaserImage: {
                alt: 'Test Product Image',
                source: 'https://example.com/test.jpg',
              },
              maxStock: 10,
            },
          ],
          totalItems: 1,
          totalPrice: 29.99,
        },
        errors: [],
      },
    };
    return HttpResponse.json({ data });
  }),

  mswGraphql.mutation('RemoveFromCart', () => {
    const data: RemoveFromCartMutationResult = {
      removeFromCart: {
        cart: {
          items: [],
          totalItems: 0,
          totalPrice: 0,
        },
        errors: [],
      },
    };
    return HttpResponse.json({ data });
  }),

  mswGraphql.mutation('ClearCart', () => {
    const data: ClearCartMutationResult = {
      clearCart: {
        cart: {
          items: [],
          totalItems: 0,
          totalPrice: 0,
        },
        errors: [],
      },
    };
    return HttpResponse.json({ data });
  }),

  mswGraphql.mutation('Checkout', () => {
    const data: CheckoutMutationResult = {
      checkout: {
        order: {
          id: '12345',
          orderNumber: 'ORD-2024-001',
          status: 'pending',
          totalAmount: 89.97,
          items: [
            {
              id: '1',
              title: 'Test Product',
              price: 29.99,
              quantity: 3,
              sku: 'TEST-001',
            },
          ],
        },
        errors: [],
        paymentRedirectUrl: 'https://payment.example.com/redirect',
      },
    };
    return HttpResponse.json({ data });
  }),

  mswGraphql.mutation('GuestLogin', () => {
    const data: GuestLoginMutationResult = {
      loginAsGuest: {
        _id: 'guest-user-123',
        tokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
      },
    };
    return HttpResponse.json({ data });
  }),
];

// Additional handlers for testing error scenarios in unit tests
export const authErrorHandlers = [
  // Cart query that returns authentication error
  mswGraphql.query('Cart', () => {
    return HttpResponse.json({
      data: null,
      errors: [
        {
          message: 'Authentication required',
          extensions: { code: 'UNAUTHENTICATED' },
        },
      ],
    });
  }),

  // Add to cart mutation that returns authentication error
  mswGraphql.mutation('AddToCart', () => {
    return HttpResponse.json({
      data: null,
      errors: [
        {
          message: 'Guest session required',
          extensions: { code: 'AUTHENTICATION_REQUIRED' },
        },
      ],
    });
  }),

  // Guest login that succeeds (for retry testing)
  mswGraphql.mutation('GuestLogin', () => {
    const data: GuestLoginMutationResult = {
      loginAsGuest: {
        _id: 'guest-user-123',
        tokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    };
    return HttpResponse.json({ data });
  }),
];

// HTTP 401 error handlers for testing
export const httpAuthErrorHandlers = [
  // Returns 401 Unauthorized
  mswGraphql.query('Cart', () => {
    return new HttpResponse(null, { status: 401 });
  }),

  // Guest login succeeds after 401
  mswGraphql.mutation('GuestLogin', () => {
    const data: GuestLoginMutationResult = {
      loginAsGuest: {
        _id: 'guest-user-123',
        tokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    };
    return HttpResponse.json({ data });
  }),
];

export { mswGraphql as graphql };
