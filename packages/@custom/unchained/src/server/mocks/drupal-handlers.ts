import { http, HttpResponse } from 'msw';

import { MOCK_PRODUCTS } from '../test-helpers/mock-data.js';

/**
 * MSW handlers for mocking Drupal GraphQL API
 * Only mocks the real Drupal GraphQL endpoint used by the cart service
 */

// Drupal GraphQL endpoint URL
const DRUPAL_BASE_URL = process.env.DRUPAL_URL || 'http://localhost:8888';

export const drupalHandlers = [
  // Mock Drupal GraphQL endpoint for the allProducts query
  http.post(`${DRUPAL_BASE_URL}/graphql`, async ({ request }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body = (await request.json()) as { query: string; variables?: any };

    // Check if this is the GetProducts query that the cart service uses
    if (body.query.includes('allProducts')) {
      return HttpResponse.json({
        data: {
          allProducts: [
            {
              uuid: 'test-product-1',
              title: MOCK_PRODUCTS.PRODUCT_1.title,
              price: MOCK_PRODUCTS.PRODUCT_1.price,
              sku: MOCK_PRODUCTS.PRODUCT_1.sku,
              stock: MOCK_PRODUCTS.PRODUCT_1.maxStock,
              teaserImage: MOCK_PRODUCTS.PRODUCT_1.teaserImage,
            },
            {
              uuid: 'test-product-2',
              title: MOCK_PRODUCTS.PRODUCT_2.title,
              price: MOCK_PRODUCTS.PRODUCT_2.price,
              sku: MOCK_PRODUCTS.PRODUCT_2.sku,
              stock: MOCK_PRODUCTS.PRODUCT_2.maxStock,
              teaserImage: MOCK_PRODUCTS.PRODUCT_2.teaserImage,
            },
          ],
        },
      });
    }

    // Return error for any other GraphQL queries (not used by cart service)
    return HttpResponse.json({
      data: null,
      errors: [{ message: 'GraphQL query not supported in test environment' }],
    });
  }),
];

/**
 * Error handlers for testing Drupal GraphQL failures
 */
export const drupalErrorHandlers = [
  // GraphQL endpoint unavailable
  http.post(`${DRUPAL_BASE_URL}/graphql`, () => {
    return HttpResponse.json(
      {
        errors: [{ message: 'Drupal GraphQL service temporarily unavailable' }],
      },
      { status: 503 },
    );
  }),
];

/**
 * Handlers for testing slow Drupal responses
 */
export const drupalSlowHandlers = [
  // Slow GraphQL endpoint
  http.post(`${DRUPAL_BASE_URL}/graphql`, async ({ request }) => {
    // Simulate 5 second delay
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body = (await request.json()) as { query: string; variables?: any };

    if (body.query.includes('allProducts')) {
      return HttpResponse.json({
        data: {
          allProducts: [
            {
              uuid: 'test-product-1',
              title: MOCK_PRODUCTS.PRODUCT_1.title,
              price: MOCK_PRODUCTS.PRODUCT_1.price,
              sku: MOCK_PRODUCTS.PRODUCT_1.sku,
              stock: MOCK_PRODUCTS.PRODUCT_1.maxStock,
              teaserImage: MOCK_PRODUCTS.PRODUCT_1.teaserImage,
            },
          ],
        },
      });
    }

    return HttpResponse.json({
      data: null,
      errors: [{ message: 'GraphQL query not supported in test environment' }],
    });
  }),
];
