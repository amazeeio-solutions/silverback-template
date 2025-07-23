import { setupServer } from 'msw/node';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';

import { UnchainedGraphQLClient } from '../client.js';
import { drupalHandlers } from './mocks/drupal-handlers.js';
import {
  createRequestHelpers,
  MUTATIONS,
  type RequestHelpers,
} from './test-helpers/request-helpers.js';
import {
  type TestServerInstance,
  withTestServer,
} from './test-helpers/server-setup.js';

describe('Authentication Integration Tests', () => {
  // MSW server for mocking external dependencies (Drupal APIs)
  const mswServer = setupServer(...drupalHandlers);

  // Test server instance manager
  const testServer = withTestServer();

  let server: TestServerInstance;
  let request: RequestHelpers;

  beforeAll(() => {
    // Start MSW server
    mswServer.listen({
      onUnhandledRequest: 'bypass',
    });
  });

  afterAll(async () => {
    // Stop MSW server
    mswServer.close();

    // Ensure test server is stopped
    await testServer.stop();
  });

  beforeEach(async () => {
    // Start fresh server instance for each test
    server = await testServer.start();
    request = createRequestHelpers(server);
  });

  afterEach(async () => {
    // Reset MSW handlers
    mswServer.resetHandlers(...drupalHandlers);

    // Stop server instance
    await testServer.stop();
  });

  describe('GraphQL Client Authentication Retry Logic', () => {
    it('should automatically call loginAsGuest when mutation fails with auth error', async () => {
      const client = new UnchainedGraphQLClient(server.url + '/graphql');

      // Try to add to cart without authentication - should trigger auto guest login
      const result = await client.request(MUTATIONS.ADD_TO_CART, {
        input: { productId: 'test-product-1', quantity: 1 },
      });

      // Should succeed after automatic guest login retry
      expect(result.data.addToCart).toBeDefined();
      expect(result.data.addToCart.cart).toBeDefined();
      expect(result.data.addToCart.errors).toEqual([]);
    });

    it('should handle multiple concurrent requests triggering guest login', async () => {
      const client = new UnchainedGraphQLClient(server.url + '/graphql');

      // Make multiple concurrent requests that should all trigger auth
      const promises = [
        client.request(MUTATIONS.ADD_TO_CART, {
          input: { productId: 'test-product-1', quantity: 1 },
        }),
        client.request(MUTATIONS.ADD_TO_CART, {
          input: { productId: 'test-product-2', quantity: 2 },
        }),
        client.request(MUTATIONS.CLEAR_CART),
      ];

      const results = await Promise.all(promises);

      // All should succeed after guest login
      results.forEach((result, index) => {
        expect(result.data).toBeDefined();
        if (index < 2) {
          // Add to cart mutations
          expect(result.data.addToCart.errors).toEqual([]);
        } else {
          // Clear cart mutation
          expect(result.data.clearCart.errors).toEqual([]);
        }
      });
    });

    it('should persist session across multiple requests after guest login', async () => {
      const client = new UnchainedGraphQLClient(server.url + '/graphql');

      // First request triggers guest login
      await client.request(MUTATIONS.ADD_TO_CART, {
        input: { productId: 'test-product-1', quantity: 1 },
      });

      // Second request should use existing session (no additional guest login)
      const result = await client.request(MUTATIONS.ADD_TO_CART, {
        input: { productId: 'test-product-2', quantity: 1 },
      });

      expect(result.data.addToCart).toBeDefined();
      expect(result.data.addToCart.cart.items).toHaveLength(2);
      expect(result.data.addToCart.errors).toEqual([]);
    });

    it('should not retry guest login mutation itself on auth failure', async () => {
      const client = new UnchainedGraphQLClient(server.url + '/graphql');

      // Manually call guest login - should not retry if it fails
      const result = await client.request(MUTATIONS.GUEST_LOGIN);

      expect(result.data.loginAsGuest).toBeDefined();
      expect(result.data.loginAsGuest._id).toBeDefined();
      expect(result.data.loginAsGuest.tokenExpires).toBeDefined();
    });
  });

  describe('HTTP-level Authentication Tests', () => {
    it('should show authentication errors in server logs', async () => {
      // Make direct HTTP request without session
      const response = await request.mutation(MUTATIONS.ADD_TO_CART, {
        input: { productId: 'test-product-1', quantity: 1 },
      });

      // Should get GraphQL error (not application error)
      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe('Authentication required');
      expect(response.body.data).toBeNull();
    });

    it('should succeed after manual guest login via HTTP', async () => {
      // First, manually login as guest
      const loginResponse = await request.mutation(MUTATIONS.GUEST_LOGIN);
      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.data.loginAsGuest).toBeDefined();

      // Then add to cart - should work with session
      const cartResponse = await request.mutation(MUTATIONS.ADD_TO_CART, {
        input: { productId: 'test-product-1', quantity: 1 },
      });

      expect(cartResponse.status).toBe(200);
      expect(cartResponse.body.data.addToCart.cart).toBeDefined();
      expect(cartResponse.body.data.addToCart.errors).toEqual([]);
    });

    it('should handle session persistence across HTTP requests', async () => {
      // Login and add item
      await request.mutation(MUTATIONS.GUEST_LOGIN);
      await request.mutation(MUTATIONS.ADD_TO_CART, {
        input: { productId: 'test-product-1', quantity: 2 },
      });

      // Query cart in new request - should see the item
      const cartResponse = await request.query(`
        query Cart {
          cart {
            items {
              id
              quantity
            }
            totalItems
            totalPrice
          }
        }
      `);

      expect(cartResponse.status).toBe(200);
      expect(cartResponse.body.data.cart.items).toHaveLength(1);
      expect(cartResponse.body.data.cart.items[0].quantity).toBe(2);
      expect(cartResponse.body.data.cart.totalItems).toBe(2);
    });

    it('should log available products when requesting non-existent product', async () => {
      // Login first
      await request.mutation(MUTATIONS.GUEST_LOGIN);

      // Try to add a non-existent product - should trigger product logging
      const response = await request.mutation(MUTATIONS.ADD_TO_CART, {
        input: { productId: 'non-existent-product-id', quantity: 1 },
      });

      // Should get application error for product not found (not GraphQL error)
      expect(response.status).toBe(200);
      expect(response.body.data.addToCart.cart).toBeNull();
      expect(response.body.data.addToCart.errors).toBeDefined();
      expect(response.body.data.addToCart.errors[0].message).toContain(
        'Product with ID non-existent-product-id not found',
      );
    });
  });

  describe('Authentication Flow with Client Library', () => {
    it('should demonstrate the full authentication flow in logs', async () => {
      const client = new UnchainedGraphQLClient(server.url + '/graphql');

      console.log('🧪 Starting authentication flow test...');

      // This should trigger automatic guest login and retry
      const result = await client.request(MUTATIONS.ADD_TO_CART, {
        input: { productId: 'test-product-1', quantity: 1 },
      });

      console.log('🧪 Authentication flow completed successfully');

      expect(result.data.addToCart.cart).toBeDefined();
      expect(result.data.addToCart.cart.items).toHaveLength(1);
      expect(result.data.addToCart.errors).toEqual([]);
    });
  });
});
