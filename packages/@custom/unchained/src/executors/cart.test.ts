import { describe, expect, it } from 'vitest';

import { UnchainedGraphQLClient } from '../client';
import { createCartExecutor } from './cart';

describe('cartExecutor', () => {
  it('should fetch cart data successfully', async () => {
    const client = new UnchainedGraphQLClient();
    const executor = createCartExecutor(client);

    const result = await executor('Cart', {});

    expect(result).toBeDefined();
    expect(result.cart).toBeDefined();
    expect(result.cart.items).toBeInstanceOf(Array);
    expect(result.cart.totalItems).toBe(2);
    expect(result.cart.totalPrice).toBe(59.98);
  });

  it('should handle cart items correctly', async () => {
    const client = new UnchainedGraphQLClient();
    const executor = createCartExecutor(client);

    const result = await executor('Cart', {});

    const firstItem = result.cart.items[0];
    expect(firstItem.id).toBe('1');
    expect(firstItem.title).toBe('Test Product');
    expect(firstItem.price).toBe(29.99);
    expect(firstItem.quantity).toBe(2);
    expect(firstItem.sku).toBe('TEST-001');
    expect(firstItem.teaserImage.alt).toBe('Test Product Image');

    // Verify that source is properly JSON-encoded ImageSource
    expect(typeof firstItem.teaserImage.source).toBe('string');
    const parsedSource = JSON.parse(firstItem.teaserImage.source);
    expect(parsedSource).toHaveProperty('url');
    expect(parsedSource).toHaveProperty('alt');
    expect(parsedSource.alt).toBe('Test Product Image');
    expect(parsedSource.url).toBe('https://example.com/test.jpg');

    expect(firstItem.maxStock).toBe(10);
  });
});
