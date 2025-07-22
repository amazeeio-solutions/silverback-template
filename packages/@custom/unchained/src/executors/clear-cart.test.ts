import { describe, expect, it } from 'vitest';

import { UnchainedGraphQLClient } from '../client';
import { createClearCartExecutor } from './clear-cart';

describe('clearCartExecutor', () => {
  it('should clear cart successfully', async () => {
    const client = new UnchainedGraphQLClient();
    const executor = createClearCartExecutor(client);

    const result = await executor('ClearCart', {});

    expect(result.data).toBeDefined();
    expect(result.data.clearCart).toBeDefined();
    expect(result.data.clearCart.cart.totalItems).toBe(0);
    expect(result.data.clearCart.cart.totalPrice).toBe(0);
    expect(result.data.clearCart.cart.items).toEqual([]);
    expect(result.data.clearCart.errors).toEqual([]);
    expect(result.error).toBeNull();
  });

  it('should return empty cart state', async () => {
    const client = new UnchainedGraphQLClient();
    const executor = createClearCartExecutor(client);

    const result = await executor('ClearCart', {});

    const cart = result.data.clearCart.cart;
    expect(cart.items).toHaveLength(0);
    expect(cart.totalItems).toBe(0);
    expect(cart.totalPrice).toBe(0);
  });
});
