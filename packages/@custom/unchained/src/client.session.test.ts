import { graphql as mswGraphql, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { UnchainedGraphQLClient } from './client';
import { AddToCartMutation, CartQuery, GuestLoginMutation } from './operations';
import { server } from './test-setup';

describe('UnchainedGraphQLClient Session Management', () => {
  let client: UnchainedGraphQLClient;

  beforeEach(() => {
    client = new UnchainedGraphQLClient();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  describe('Automatic Guest Login with GraphQL Auth Errors', () => {
    it('should automatically retry with guest login on authentication error', async () => {
      let authErrorReturned = false;

      server.use(
        // Cart query returns auth error first, then success
        mswGraphql.query('Cart', () => {
          if (!authErrorReturned) {
            authErrorReturned = true;
            return HttpResponse.json({
              data: null,
              errors: [
                {
                  message: 'Authentication required',
                  extensions: { code: 'UNAUTHENTICATED' },
                },
              ],
            });
          }

          // After guest login, return success
          return HttpResponse.json({
            data: {
              cart: {
                items: [
                  {
                    id: '1',
                    title: 'Test Product',
                    price: 29.99,
                    quantity: 2,
                    sku: 'TEST-001',
                    teaserImage: { alt: 'Test', source: 'test.jpg' },
                    maxStock: 10,
                  },
                ],
                totalItems: 2,
                totalPrice: 59.98,
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

      const result = await client.request(CartQuery);

      expect(result).toBeDefined();
      expect(result.cart).toBeDefined();
      expect(result.cart.totalItems).toBe(2);
      expect(authErrorReturned).toBe(true); // Verify auth error was returned first
    });

    it('should handle authentication errors in mutations', async () => {
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
                      teaserImage: { alt: 'Test', source: 'test.jpg' },
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

      const result = await client.request(AddToCartMutation, {
        input: { productId: 'TEST-001', quantity: 1 },
      });

      expect(result).toBeDefined();
      expect(result.addToCart.cart).toBeDefined();
      expect(result.addToCart.cart.totalItems).toBe(3);
    });

    it('should not retry guest login requests', async () => {
      server.use(
        // Guest login returns auth error
        mswGraphql.mutation('GuestLogin', () => {
          return HttpResponse.json({
            data: null,
            errors: [
              {
                message: 'Guest login failed',
                extensions: { code: 'AUTHENTICATION_REQUIRED' },
              },
            ],
          });
        }),
      );

      await expect(client.request(GuestLoginMutation)).rejects.toThrow(
        'Guest login failed',
      );
    });
  });

  describe('HTTP 401 Error Handling', () => {
    it('should automatically retry with guest login on HTTP 401', async () => {
      let httpErrorReturned = false;

      server.use(
        // Cart returns 401 first, then success
        mswGraphql.query('Cart', () => {
          if (!httpErrorReturned) {
            httpErrorReturned = true;
            return new HttpResponse(null, { status: 401 });
          }

          return HttpResponse.json({
            data: {
              cart: {
                items: [],
                totalItems: 0,
                totalPrice: 0,
              },
            },
          });
        }),

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

      const result = await client.request(CartQuery);

      expect(result).toBeDefined();
      expect(result.cart).toBeDefined();
      expect(httpErrorReturned).toBe(true);
    });

    it('should not retry HTTP 401 on guest login requests', async () => {
      server.use(
        // Guest login returns 401
        mswGraphql.mutation('GuestLogin', () => {
          return new HttpResponse(null, { status: 401 });
        }),
      );

      await expect(client.request(GuestLoginMutation)).rejects.toThrow(
        'HTTP error! status: 401',
      );
    });
  });

  describe('Error Scenarios', () => {
    it('should throw error if guest login fails', async () => {
      server.use(
        // Cart needs auth
        mswGraphql.query('Cart', () => {
          return HttpResponse.json({
            data: null,
            errors: [{ message: 'Authentication required' }],
          });
        }),
        // Guest login fails
        mswGraphql.mutation('GuestLogin', () => {
          return HttpResponse.json({
            data: null,
            errors: [{ message: 'Guest login service unavailable' }],
          });
        }),
      );

      await expect(client.request(CartQuery)).rejects.toThrow(
        'Guest login failed',
      );
    });

    it('should throw error if retry still fails after guest login', async () => {
      server.use(
        // Cart always returns auth error (even after guest login)
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
        // Guest login succeeds
        mswGraphql.mutation('GuestLogin', () => {
          return HttpResponse.json({
            data: {
              loginAsGuest: {
                _id: 'guest-123',
                tokenExpires: new Date().toISOString(),
              },
            },
          });
        }),
      );

      await expect(client.request(CartQuery)).rejects.toThrow(
        'Authentication required',
      );
    });
  });
});
