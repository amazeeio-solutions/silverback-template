import { describe, expect, it } from 'vitest';

import { UnchainedGraphQLClient } from '../client';
import { createUpdateCartItemExecutor } from './update-cart-item';

describe('updateCartItemExecutor', () => {
  it('should update cart item quantity successfully', async () => {
    const client = new UnchainedGraphQLClient();
    const executor = createUpdateCartItemExecutor(client);

    const result = await executor('UpdateCartItem', {
      input: {
        itemId: '1',
        quantity: 1,
      },
    });

    expect(result.data).toBeDefined();
    expect(result.data.updateCartItem).toBeDefined();
    expect(result.data.updateCartItem.cart.totalItems).toBe(1);
    expect(result.data.updateCartItem.cart.totalPrice).toBe(29.99);
    expect(result.data.updateCartItem.errors).toEqual([]);
    expect(result.error).toBeNull();
  });

  it('should handle quantity updates correctly', async () => {
    const client = new UnchainedGraphQLClient();
    const executor = createUpdateCartItemExecutor(client);

    const result = await executor('UpdateCartItem', {
      input: {
        itemId: '1',
        quantity: 1,
      },
    });

    const cart = result.data.updateCartItem.cart;
    expect(cart.items).toHaveLength(1);

    const item = cart.items[0];
    expect(item.quantity).toBe(1);
    expect(item.id).toBe('1');
  });
});
