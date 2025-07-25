import { describe, expect, it } from 'vitest';

import { UnchainedGraphQLClient } from '../client';
import { createClearCartExecutor } from './clear-cart';

describe('clearCartExecutor', () => {
  it('should clear cart successfully', async () => {
    const client = new UnchainedGraphQLClient();
    const executor = createClearCartExecutor(client);

    const result = await executor('ClearCart', {});

    expect(result).toBeDefined();
    expect(result.clearCart).toBeDefined();
    expect(result.clearCart.cart.totalItems).toBe(0);
    expect(result.clearCart.cart.totalPrice).toBe(0);
    expect(result.clearCart.cart.items).toEqual([]);
    expect(result.clearCart.errors).toEqual([]);
  });

  it('should return empty cart state', async () => {
    const client = new UnchainedGraphQLClient();
    const executor = createClearCartExecutor(client);

    const result = await executor('ClearCart', {});

    const cart = result.clearCart.cart;
    expect(cart.items).toHaveLength(0);
    expect(cart.totalItems).toBe(0);
    expect(cart.totalPrice).toBe(0);
  });
});
