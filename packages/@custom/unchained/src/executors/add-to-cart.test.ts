import { describe, expect, it } from 'vitest';

import { UnchainedGraphQLClient } from '../client';
import { createAddToCartExecutor } from './add-to-cart';

describe('addToCartExecutor', () => {
  it('should add item to cart successfully', async () => {
    const client = new UnchainedGraphQLClient();
    const executor = createAddToCartExecutor(client);

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
  });

  it('should handle cart updates correctly', async () => {
    const client = new UnchainedGraphQLClient();
    const executor = createAddToCartExecutor(client);

    const result = await executor('AddToCart', {
      input: {
        productId: 'TEST-001',
        quantity: 2,
      },
    });

    const cart = result.data.addToCart.cart;
    expect(cart.items).toHaveLength(1);

    const item = cart.items[0];
    expect(item.quantity).toBe(3);
    expect(item.title).toBe('Test Product');
  });
});
