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

import {
  drupalErrorHandlers,
  drupalHandlers,
} from './mocks/drupal-handlers.js';
import {
  createEmptyCart,
  createExpectedCart,
  MOCK_CART_ITEMS,
  MOCK_USER_DATA,
} from './test-helpers/mock-data.js';
import {
  type CartData,
  type CartMutationData,
  type CheckoutData,
  createRequestHelpers,
  type GuestLoginData,
  MUTATIONS,
  QUERIES,
  type RequestHelpers,
} from './test-helpers/request-helpers.js';
import {
  type TestServerInstance,
  withTestServer,
} from './test-helpers/server-setup.js';

describe('Unchained Server Integration Tests', () => {
  // MSW server for mocking external dependencies (Drupal APIs)
  // Only intercept external HTTP requests, not GraphQL requests to our server
  const mswServer = setupServer(...drupalHandlers);

  // Test server instance manager
  const testServer = withTestServer();

  let server: TestServerInstance;
  let request: RequestHelpers;

  beforeAll(() => {
    // Start MSW server with configuration to only intercept external requests
    mswServer.listen({
      onUnhandledRequest: 'bypass', // Don't warn about local server requests
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
    // Reset MSW handlers to drupal handlers only
    mswServer.resetHandlers(...drupalHandlers);

    // Stop server instance
    await testServer.stop();
  });

  describe('Server Lifecycle', () => {
    it('should start server successfully', () => {
      expect(server).toBeDefined();
      expect(server.port).toBeGreaterThan(0);
      expect(server.url).toMatch(/^http:\/\/localhost:\d+$/);
    });

    it('should respond to health check', async () => {
      const response = await request.health();

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'ok',
        timestamp: expect.any(String),
        service: 'unchained-mock-api',
      });
    });

    it('should respond to root endpoint', async () => {
      const response = await request.root();

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Unchained Commerce Mock API',
        graphql: '/graphql',
        health: '/health',
      });
    });
  });

  describe('GraphQL Endpoint', () => {
    it('should handle invalid GraphQL queries', async () => {
      const response = await request.query('invalid query');

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('Syntax Error');
    });

    it('should handle introspection queries', async () => {
      const response = await request.query(`
        query IntrospectionQuery {
          __schema {
            types {
              name
            }
          }
        }
      `);

      expect(response.status).toBe(200);
      expect(response.body.data.__schema).toBeDefined();
      expect(response.body.data.__schema.types).toBeInstanceOf(Array);
    });
  });

  describe('Authentication Flow', () => {
    it('should create guest session', async () => {
      const response = await request.mutation<GuestLoginData>(
        MUTATIONS.GUEST_LOGIN,
      );

      expect(response.status).toBe(200);
      expect(response.body.data?.loginAsGuest).toEqual({
        _id: expect.any(String),
        tokenExpires: expect.any(String),
      });

      // Verify token expiration is in the future
      const expirationDate = new Date(
        response.body.data!.loginAsGuest.tokenExpires,
      );
      expect(expirationDate.getTime()).toBeGreaterThan(Date.now());
    });

    it('should persist session across requests', async () => {
      // Create guest session
      const loginResponse = await request.mutation<GuestLoginData>(
        MUTATIONS.GUEST_LOGIN,
      );
      expect(loginResponse.status).toBe(200);

      // Make subsequent request with same agent (preserves cookies)
      const cartResponse = await request.query<CartData>(QUERIES.CART);
      expect(cartResponse.status).toBe(200);

      // The cart should be accessible (not return authentication error)
      expect(cartResponse.body.data?.cart).toBeDefined();
    });
  });

  describe('Cart Operations', () => {
    describe('Query Cart', () => {
      it('should return empty cart for unauthenticated requests', async () => {
        const response = await request.query<CartData>(QUERIES.CART);

        expect(response.status).toBe(200);
        expect(response.body.data?.cart).toEqual(createEmptyCart());
      });

      it('should return empty cart for authenticated guest', async () => {
        // Login as guest
        await request.mutation(MUTATIONS.GUEST_LOGIN);

        const response = await request.query<CartData>(QUERIES.CART);

        expect(response.status).toBe(200);
        expect(response.body.data?.cart).toEqual(createEmptyCart());
      });
    });

    describe('Add to Cart', () => {
      it('should require authentication', async () => {
        const response = await request.mutation<CartMutationData>(
          MUTATIONS.ADD_TO_CART,
          { input: { productId: 'test-product-1', quantity: 1 } },
        );

        expect(response.status).toBe(200);
        expect(response.body.data).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe('Authentication required');
      });

      it('should add product to cart for authenticated user', async () => {
        // Login as guest
        await request.mutation(MUTATIONS.GUEST_LOGIN);

        const response = await request.mutation<CartMutationData>(
          MUTATIONS.ADD_TO_CART,
          { input: { productId: 'test-product-1', quantity: 2 } },
        );

        expect(response.status).toBe(200);
        expect(response.body.data?.addToCart.errors).toEqual([]);
        expect(response.body.data?.addToCart.cart).toEqual(
          createExpectedCart([
            {
              ...MOCK_CART_ITEMS.SINGLE_ITEM[0],
              quantity: 2,
            },
          ]),
        );
      });

      it('should handle adding multiple different products', async () => {
        // Login as guest
        await request.mutation(MUTATIONS.GUEST_LOGIN);

        // Add first product
        await request.mutation(MUTATIONS.ADD_TO_CART, {
          input: { productId: 'test-product-1', quantity: 1 },
        });

        // Add second product
        const response = await request.mutation<CartMutationData>(
          MUTATIONS.ADD_TO_CART,
          { input: { productId: 'test-product-2', quantity: 2 } },
        );

        expect(response.status).toBe(200);
        expect(response.body.data?.addToCart.cart?.items).toHaveLength(2);
        expect(response.body.data?.addToCart.cart?.totalItems).toBe(3);
      });
    });

    describe('Update Cart Item', () => {
      beforeEach(async () => {
        // Setup: Login and add item to cart
        await request.mutation(MUTATIONS.GUEST_LOGIN);
        await request.mutation(MUTATIONS.ADD_TO_CART, {
          input: { productId: 'test-product-1', quantity: 2 },
        });
      });

      it('should require authentication', async () => {
        // Create new request instance (no session)
        const newRequest = createRequestHelpers(server);

        const response = await newRequest.mutation<CartMutationData>(
          MUTATIONS.UPDATE_CART_ITEM,
          { input: { itemId: '1', quantity: 3 } },
        );

        expect(response.status).toBe(200);
        expect(response.body.data).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe('Authentication required');
      });

      it('should update item quantity', async () => {
        const response = await request.mutation<CartMutationData>(
          MUTATIONS.UPDATE_CART_ITEM,
          { input: { itemId: 'test-product-1', quantity: 5 } },
        );

        expect(response.status).toBe(200);
        expect(response.body.data?.updateCartItem.errors).toEqual([]);
        expect(response.body.data?.updateCartItem.cart?.items[0].quantity).toBe(
          5,
        );
        expect(response.body.data?.updateCartItem.cart?.totalItems).toBe(5);
      });

      it('should handle updating non-existent item', async () => {
        const response = await request.mutation<CartMutationData>(
          MUTATIONS.UPDATE_CART_ITEM,
          { input: { itemId: 'non-existent', quantity: 1 } },
        );

        expect(response.status).toBe(200);
        expect(response.body.data?.updateCartItem.cart).toBeNull();
        expect(response.body.data?.updateCartItem.errors).toHaveLength(1);
      });
    });

    describe('Remove from Cart', () => {
      beforeEach(async () => {
        // Setup: Login and add item to cart
        await request.mutation(MUTATIONS.GUEST_LOGIN);
        await request.mutation(MUTATIONS.ADD_TO_CART, {
          input: { productId: 'test-product-1', quantity: 2 },
        });
      });

      it('should require authentication', async () => {
        // Create new request instance (no session)
        const newRequest = createRequestHelpers(server);

        const response = await newRequest.mutation<CartMutationData>(
          MUTATIONS.REMOVE_FROM_CART,
          { productId: 'test-product-1' },
        );

        expect(response.status).toBe(200);
        expect(response.body.data).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe('Authentication required');
      });

      it('should remove product from cart', async () => {
        const response = await request.mutation<CartMutationData>(
          MUTATIONS.REMOVE_FROM_CART,
          { productId: 'test-product-1' },
        );

        expect(response.status).toBe(200);
        expect(response.body.data?.removeFromCart.errors).toEqual([]);
        expect(response.body.data?.removeFromCart.cart).toEqual(
          createEmptyCart(),
        );
      });
    });

    describe('Clear Cart', () => {
      beforeEach(async () => {
        // Setup: Login and add items to cart
        await request.mutation(MUTATIONS.GUEST_LOGIN);
        await request.mutation(MUTATIONS.ADD_TO_CART, {
          input: { productId: 'test-product-1', quantity: 2 },
        });
        await request.mutation(MUTATIONS.ADD_TO_CART, {
          input: { productId: 'test-product-2', quantity: 1 },
        });
      });

      it('should require authentication', async () => {
        // Create new request instance (no session)
        const newRequest = createRequestHelpers(server);

        const response = await newRequest.mutation<CartMutationData>(
          MUTATIONS.CLEAR_CART,
        );

        expect(response.status).toBe(200);
        expect(response.body.data).toBeNull();
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe('Authentication required');
      });

      it('should clear all items from cart', async () => {
        const response = await request.mutation<CartMutationData>(
          MUTATIONS.CLEAR_CART,
        );

        expect(response.status).toBe(200);
        expect(response.body.data?.clearCart.errors).toEqual([]);
        expect(response.body.data?.clearCart.cart).toEqual(createEmptyCart());
      });
    });
  });

  describe('Checkout Flow', () => {
    beforeEach(async () => {
      // Setup: Login and add items to cart
      await request.mutation(MUTATIONS.GUEST_LOGIN);
      await request.mutation(MUTATIONS.ADD_TO_CART, {
        input: { productId: 'test-product-1', quantity: 2 },
      });
    });

    it('should require authentication', async () => {
      // Create new request instance (no session)
      const newRequest = createRequestHelpers(server);

      const response = await newRequest.mutation<CheckoutData>(
        MUTATIONS.CHECKOUT,
        { input: MOCK_USER_DATA.VALID_CHECKOUT },
      );

      expect(response.status).toBe(200);
      expect(response.body.data).toBeNull();
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe('Authentication required');
    });

    it('should process successful checkout', async () => {
      const response = await request.mutation<CheckoutData>(
        MUTATIONS.CHECKOUT,
        { input: MOCK_USER_DATA.VALID_CHECKOUT },
      );

      expect(response.status).toBe(200);
      expect(response.body.data?.checkout.errors).toEqual([]);
      expect(response.body.data?.checkout.order).toEqual({
        id: expect.any(String),
        orderNumber: expect.any(String),
        status: 'pending',
        totalAmount: expect.any(Number),
        items: expect.any(Array),
      });
      expect(response.body.data?.checkout.paymentRedirectUrl).toBeDefined();
    });

    it('should process checkout even with minimal input', async () => {
      const response = await request.mutation<CheckoutData>(
        MUTATIONS.CHECKOUT,
        { input: MOCK_USER_DATA.INVALID_CHECKOUT },
      );

      expect(response.status).toBe(200);
      expect(response.body.data?.checkout.errors).toEqual([]);
      expect(response.body.data?.checkout.order).toEqual({
        id: expect.any(String),
        orderNumber: expect.any(String),
        status: 'pending',
        totalAmount: expect.any(Number),
        items: expect.any(Array),
      });
      expect(response.body.data?.checkout.paymentRedirectUrl).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle external service failures gracefully', async () => {
      // Use error handlers for MSW
      mswServer.use(...drupalErrorHandlers);

      // Login should still work (local operation)
      const loginResponse = await request.mutation(MUTATIONS.GUEST_LOGIN);
      expect(loginResponse.status).toBe(200);

      // But operations that depend on external services might fail gracefully
      const cartResponse = await request.query(QUERIES.CART);
      expect(cartResponse.status).toBe(200);
      // Cart should still return empty rather than error
      expect(cartResponse.body.data?.cart).toEqual(createEmptyCart());
    });

    it('should handle malformed requests', async () => {
      const response = await request.agent
        .post('/graphql')
        .send('invalid json')
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
    });

    it('should handle requests without Content-Type', async () => {
      const response = await request.agent
        .post('/graphql')
        .send({ query: QUERIES.CART });

      expect(response.status).toBe(200);
    });
  });
});
