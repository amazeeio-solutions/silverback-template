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

    expect(result).toBeDefined();
    expect(result.removeFromCart).toBeDefined();
    expect(result.removeFromCart.cart.totalItems).toBe(0);
    expect(result.removeFromCart.cart.totalPrice).toBe(0);
    expect(result.removeFromCart.cart.items).toEqual([]);
    expect(result.removeFromCart.errors).toEqual([]);
  });

  it('should handle empty cart after removal', async () => {
    const client = new UnchainedGraphQLClient();
    const executor = createRemoveFromCartExecutor(client);

    const result = await executor('RemoveFromCart', {
      productId: 'TEST-001',
    });

    const cart = result.removeFromCart.cart;
    expect(cart.items).toHaveLength(0);
    expect(cart.totalItems).toBe(0);
    expect(cart.totalPrice).toBe(0);
  });
});
