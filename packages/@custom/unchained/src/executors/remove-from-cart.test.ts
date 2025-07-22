import { describe, expect, it } from 'vitest';

import { UnchainedGraphQLClient } from '../client';
import { createRemoveFromCartExecutor } from './remove-from-cart';

describe('removeFromCartExecutor', () => {
  it('should remove item from cart successfully', async () => {
    const client = new UnchainedGraphQLClient();
    const executor = createRemoveFromCartExecutor(client);

    const result = await executor('RemoveFromCart', {
      productId: 'TEST-001',
    });

    expect(result.data).toBeDefined();
    expect(result.data.removeFromCart).toBeDefined();
    expect(result.data.removeFromCart.cart.totalItems).toBe(0);
    expect(result.data.removeFromCart.cart.totalPrice).toBe(0);
    expect(result.data.removeFromCart.cart.items).toEqual([]);
    expect(result.data.removeFromCart.errors).toEqual([]);
    expect(result.error).toBeNull();
  });

  it('should handle empty cart after removal', async () => {
    const client = new UnchainedGraphQLClient();
    const executor = createRemoveFromCartExecutor(client);

    const result = await executor('RemoveFromCart', {
      productId: 'TEST-001',
    });

    const cart = result.data.removeFromCart.cart;
    expect(cart.items).toHaveLength(0);
    expect(cart.totalItems).toBe(0);
    expect(cart.totalPrice).toBe(0);
  });
});
