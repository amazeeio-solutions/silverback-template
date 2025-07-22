import { describe, expect, it } from 'vitest';

import { UnchainedGraphQLClient } from '../client';
import { createCartExecutor } from './cart';

describe('cartExecutor', () => {
  it('should fetch cart data successfully', async () => {
    const client = new UnchainedGraphQLClient();
    const executor = createCartExecutor(client);

    const result = await executor('Cart', {});

    expect(result.data).toBeDefined();
    expect(result.data.cart).toBeDefined();
    expect(result.data.cart.items).toBeInstanceOf(Array);
    expect(result.data.cart.totalItems).toBe(2);
    expect(result.data.cart.totalPrice).toBe(59.98);
    expect(result.error).toBeNull();
  });

  it('should handle cart items correctly', async () => {
    const client = new UnchainedGraphQLClient();
    const executor = createCartExecutor(client);

    const result = await executor('Cart', {});

    const firstItem = result.data.cart.items[0];
    expect(firstItem.id).toBe('1');
    expect(firstItem.title).toBe('Test Product');
    expect(firstItem.price).toBe(29.99);
    expect(firstItem.quantity).toBe(2);
    expect(firstItem.sku).toBe('TEST-001');
    expect(firstItem.teaserImage.alt).toBe('Test Product Image');
    expect(firstItem.maxStock).toBe(10);
  });
});
