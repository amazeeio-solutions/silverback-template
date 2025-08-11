import type { ResultOf } from 'gql.tada';
import { graphql as mswGraphql, HttpResponse } from 'msw';

import {
  AddToCartMutation,
  CartQuery,
  CheckoutMutation,
  ClearCartMutation,
  GuestLoginMutation,
  RemoveFromCartMutation,
  SignPaymentProviderForCheckoutMutation,
  UpdateCartItemMutation,
  UpdateCartMutation,
} from '../operations';

// Define types using gql.tada for type-safe mock responses
type CartQueryResult = ResultOf<typeof CartQuery>;
type AddToCartMutationResult = ResultOf<typeof AddToCartMutation>;
type UpdateCartItemMutationResult = ResultOf<typeof UpdateCartItemMutation>;
type RemoveFromCartMutationResult = ResultOf<typeof RemoveFromCartMutation>;
type ClearCartMutationResult = ResultOf<typeof ClearCartMutation>;
type CheckoutMutationResult = ResultOf<typeof CheckoutMutation>;
type SignPaymentProviderMutationResult = ResultOf<
  typeof SignPaymentProviderForCheckoutMutation
>;
type UpdateCartMutationResult = ResultOf<typeof UpdateCartMutation>;
type GuestLoginMutationResult = ResultOf<typeof GuestLoginMutation>;

// These handlers mock the Unchained Commerce API for unit tests
// They should NOT mock external Drupal endpoints - those are mocked in drupal-handlers.ts
export const handlers = [
  mswGraphql.query('Cart', () => {
    const data: CartQueryResult = {
      me: {
        cart: {
          items: [
            {
              _id: '1',
              product: {
                _id: 'prod-1',
                texts: {
                  title: 'Test Product',
                },
              },
              quantity: 2,
              originalProduct: {
                _id: 'prod-1',
                texts: {
                  title: 'Test Product',
                },
                media: [
                  {
                    file: {
                      url: 'https://example.com/test.jpg',
                    },
                  },
                ],
              },
              unitPrice: {
                amount: 2999,
                currencyCode: 'USD',
              },
            },
          ],
          total: {
            amount: 5998,
            currencyCode: 'USD',
          },
        },
      },
    };
    return HttpResponse.json({ data });
  }),

  mswGraphql.mutation('AddToCart', () => {
    const data: AddToCartMutationResult = {
      addCartProduct: {
        _id: '2',
        product: {
          _id: 'prod-1',
          texts: {
            title: 'Test Product',
          },
        },
        quantity: 3,
        originalProduct: {
          _id: 'prod-1',
          texts: {
            title: 'Test Product',
          },
          media: [
            {
              file: {
                url: 'https://example.com/test.jpg',
              },
            },
          ],
        },
        unitPrice: {
          amount: 2999,
          currencyCode: 'USD',
        },
      },
    };
    return HttpResponse.json({ data });
  }),

  mswGraphql.mutation('UpdateCartItem', () => {
    const data: UpdateCartItemMutationResult = {
      updateCartItem: {
        _id: '1',
        product: {
          _id: 'prod-1',
          texts: {
            title: 'Test Product',
          },
        },
        quantity: 1,
        originalProduct: {
          _id: 'prod-1',
          texts: {
            title: 'Test Product',
          },
          media: [
            {
              file: {
                url: 'https://example.com/test.jpg',
              },
            },
          ],
        },
        unitPrice: {
          amount: 2999,
          currencyCode: 'USD',
        },
      },
    };
    return HttpResponse.json({ data });
  }),

  mswGraphql.mutation('RemoveFromCart', () => {
    const data: RemoveFromCartMutationResult = {
      removeCartItem: {
        _id: '1',
        product: {
          _id: 'prod-1',
          texts: {
            title: 'Test Product',
          },
        },
        quantity: 0,
        originalProduct: {
          _id: 'prod-1',
          texts: {
            title: 'Test Product',
          },
          media: [
            {
              file: {
                url: 'https://example.com/test.jpg',
              },
            },
          ],
        },
        unitPrice: {
          amount: 2999,
          currencyCode: 'USD',
        },
      },
    };
    return HttpResponse.json({ data });
  }),

  mswGraphql.mutation('ClearCart', () => {
    const data: ClearCartMutationResult = {
      emptyCart: {
        _id: 'cart-123',
        items: [],
        total: {
          amount: 0,
          currencyCode: 'USD',
        },
      },
    };
    return HttpResponse.json({ data });
  }),

  mswGraphql.mutation('Checkout', () => {
    const data: CheckoutMutationResult = {
      checkoutCart: {
        _id: '12345',
        orderNumber: 'ORD-2024-001',
        status: 'PENDING',
        total: {
          amount: 8997,
          currencyCode: 'USD',
        },
        items: [
          {
            _id: '1',
            product: {
              _id: 'prod-1',
              texts: {
                title: 'Test Product',
              },
            },
            quantity: 3,
            unitPrice: {
              amount: 2999,
              currencyCode: 'USD',
            },
          },
        ],
      },
    };
    return HttpResponse.json({ data });
  }),

  mswGraphql.mutation('SignPaymentProviderForCheckout', () => {
    const data: SignPaymentProviderMutationResult = {
      signPaymentProviderForCheckout: JSON.stringify({
        status: 'success',
        data: [
          {
            id: 26173262,
            status: 'waiting',
            hash: '569af0f32a9e9902a65361a045e62a59',
            referenceId: '838bd5a79afb5c62341cb0ed',
            link: 'https://unchained-test.payrexx.com/?payment=569af0f32a9e9902a65361a045e62a59',
            invoices: [],
            preAuthorization: true,
            fields: {
              email: { active: false, mandatory: true },
              forename: { active: false, mandatory: true },
              surname: { active: false, mandatory: true },
            },
            psp: [44, 36],
            pm: [],
            amount: 200,
            currency: 'CHF',
            vatRate: 0,
            sku: null,
            applicationFee: 0,
            createdAt: 1754899076,
            requestId: 26256145,
          },
        ],
      }),
    };
    return HttpResponse.json({ data });
  }),

  mswGraphql.mutation('UpdateCart', ({ variables }) => {
    // Simulate different payment provider based on email for testing and donation amount
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vars = variables as any;
    const email = vars?.contact?.emailAddress || '';
    const donation = vars?.meta?.donation || 0;
    const isPaidCheckout =
      email.includes('paid') || email.includes('premium') || donation > 0;

    // Calculate total: donation amount (already in cents from variable mapping)
    const totalAmount = isPaidCheckout ? donation : 0;

    const data: UpdateCartMutationResult = {
      updateCart: {
        _id: '12345',
        orderNumber: 'ORD-2024-001',
        billingAddress: {
          firstName: vars?.billingAddress?.firstName || 'John',
          lastName: vars?.billingAddress?.lastName || 'Doe',
          company: null,
          addressLine: vars?.billingAddress?.addressLine || '123 Main Street',
          addressLine2: null,
          postalCode: vars?.billingAddress?.postalCode || '10001',
          regionCode: null,
          city: vars?.billingAddress?.city || 'New York',
          countryCode: vars?.billingAddress?.countryCode || 'US',
        },
        contact: {
          emailAddress: vars?.contact?.emailAddress || 'test@example.com',
          telNumber: null,
        },
        payment: {
          _id: isPaidCheckout ? 'payment-generic' : 'payment-invoice',
          provider: {
            _id: isPaidCheckout ? 'payrex-provider' : 'invoice-provider',
            type: isPaidCheckout ? 'GENERIC' : 'INVOICE',
            interface: {
              _id: isPaidCheckout ? 'interface-payrex' : 'interface-invoice',
            },
          },
        },
        total: {
          amount: totalAmount,
          currencyCode: 'CHF', // Changed to CHF to match donation currency
        },
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
