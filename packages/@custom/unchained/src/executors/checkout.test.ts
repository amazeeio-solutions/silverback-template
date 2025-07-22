import { describe, expect, it } from 'vitest';

import { UnchainedGraphQLClient } from '../client';
import { createCheckoutExecutor } from './checkout';

describe('checkoutExecutor', () => {
  const checkoutInput = {
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    address: '123 Main St',
    city: 'Anytown',
    postalCode: '12345',
    country: 'US',
  };

  it('should process checkout successfully', async () => {
    const client = new UnchainedGraphQLClient();
    const executor = createCheckoutExecutor(client);

    const result = await executor('Checkout', {
      input: checkoutInput,
    });

    expect(result.data).toBeDefined();
    expect(result.data.checkout).toBeDefined();
    expect(result.data.checkout.order).toBeDefined();
    expect(result.data.checkout.order.id).toBe('12345');
    expect(result.data.checkout.order.orderNumber).toBe('ORD-2024-001');
    expect(result.data.checkout.order.status).toBe('pending');
    expect(result.data.checkout.paymentRedirectUrl).toBe(
      'https://payment.example.com/redirect',
    );
    expect(result.data.checkout.errors).toEqual([]);
    expect(result.error).toBeNull();
  });

  it('should handle order details correctly', async () => {
    const client = new UnchainedGraphQLClient();
    const executor = createCheckoutExecutor(client);

    const result = await executor('Checkout', {
      input: checkoutInput,
    });

    const order = result.data.checkout.order;
    expect(order.totalAmount).toBe(89.97);
    expect(order.items).toHaveLength(1);

    const item = order.items[0];
    expect(item.title).toBe('Test Product');
    expect(item.quantity).toBe(3);
    expect(item.price).toBe(29.99);
    expect(item.sku).toBe('TEST-001');
  });

  it('should handle minimal checkout input', async () => {
    const client = new UnchainedGraphQLClient();
    const executor = createCheckoutExecutor(client);

    const minimalInput = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
    };

    const result = await executor('Checkout', {
      input: minimalInput,
    });

    expect(result.data.checkout.order).toBeDefined();
    expect(result.error).toBeNull();
  });
});
