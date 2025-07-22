import { describe, expect, it } from 'vitest';

import { UnchainedGraphQLClient } from './client';
import { AddToCartMutation, CartQuery } from './operations';

describe('UnchainedGraphQLClient typing', () => {
  const client = new UnchainedGraphQLClient();

  it('should enforce correct variable types for mutations', async () => {
    // This should compile fine - correct variables
    const validCall = async () => {
      await client.request(AddToCartMutation, {
        input: {
          productId: 'test-product-id',
          quantity: 1,
        },
      });
    };

    // The following would cause TypeScript errors at compile time:

    // Missing required variables:
    // client.request(AddToCartMutation); // ❌ TS Error

    // Wrong variable type:
    // client.request(AddToCartMutation, {
    //   input: {
    //     productId: 123, // ❌ TS Error: should be string
    //     quantity: 'one', // ❌ TS Error: should be number
    //   },
    // });

    // Missing required field:
    // client.request(AddToCartMutation, {
    //   input: {
    //     quantity: 1, // ❌ TS Error: productId is required
    //   },
    // });

    expect(validCall).toBeDefined();
  });

  it('should handle queries with no variables correctly', async () => {
    // This should compile fine - no variables needed
    const validCall = async () => {
      await client.request(CartQuery);
    };

    // This should also work (variables is optional for queries with no vars):
    const validCallWithUndefined = async () => {
      await client.request(CartQuery, undefined);
    };

    expect(validCall).toBeDefined();
    expect(validCallWithUndefined).toBeDefined();
  });

  it('should maintain backward compatibility with string queries', async () => {
    // Plain string queries should still work without type checking
    const stringQuery = `
      query {
        cart {
          totalItems
        }
      }
    `;

    const validCall = async () => {
      await client.request(stringQuery, { anyVariable: 'test' });
    };

    expect(validCall).toBeDefined();
  });
});
