import { graphql as mswGraphql, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { UnchainedGraphQLClient } from '../../client';
import { server } from '../../test-setup';
import { createSessionAwareAddToCartExecutor } from './add-to-cart';

describe('sessionAwareAddToCartExecutor', () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it('should add item to cart successfully with automatic guest login', async () => {
    let authErrorReturned = false;

    server.use(
      // AddToCart returns auth error first, then success
      mswGraphql.mutation('AddToCart', () => {
        if (!authErrorReturned) {
          authErrorReturned = true;
          return HttpResponse.json({
            data: null,
            errors: [
              {
                message: 'Guest session required',
                extensions: { code: 'AUTHENTICATION_REQUIRED' },
              },
            ],
          });
        }

        return HttpResponse.json({
          data: {
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
          },
        });
      }),

      // Guest login succeeds
      mswGraphql.mutation('GuestLogin', () => {
        return HttpResponse.json({
          data: {
            loginAsGuest: {
              _id: 'guest-user-123',
              tokenExpires: new Date(
                Date.now() + 24 * 60 * 60 * 1000,
              ).toISOString(),
            },
          },
        });
      }),
    );

    const client = new UnchainedGraphQLClient();
    const executor = createSessionAwareAddToCartExecutor(client);

    const result = await executor('AddToCart', {
      input: {
        productId: 'TEST-001',
        quantity: 1,
      },
    });

    expect(result.data).toBeDefined();
    expect(result.data.addToCart).toBeDefined();
    expect(result.data.addToCart.cart.totalItems).toBe(3);
    expect(result.data.addToCart.cart.totalPrice).toBe(89.97);
    expect(result.data.addToCart.errors).toEqual([]);
    expect(result.error).toBeNull();
    expect(authErrorReturned).toBe(true); // Verify auth error was handled
  });

  it('should work without auth errors when session exists', async () => {
    server.use(
      // AddToCart succeeds immediately
      mswGraphql.mutation('AddToCart', () => {
        return HttpResponse.json({
          data: {
            addToCart: {
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
          },
        });
      }),
    );

    const client = new UnchainedGraphQLClient();
    const executor = createSessionAwareAddToCartExecutor(client);

    const result = await executor('AddToCart', {
      input: {
        productId: 'TEST-001',
        quantity: 1,
      },
    });

    expect(result.data).toBeDefined();
    expect(result.data.addToCart.cart.totalItems).toBe(1);
    expect(result.error).toBeNull();
  });
});
