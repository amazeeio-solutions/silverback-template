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

  it('should process free checkout successfully (INVOICE provider)', async () => {
    const client = new UnchainedGraphQLClient();
    const executor = createCheckoutExecutor(client);

    const result = await executor('Checkout', {
      input: checkoutInput,
    });

    expect(result).toBeDefined();
    expect(result.checkout).toBeDefined();
    expect(result.checkout.order).toBeDefined();
    expect(result.checkout.order.id).toBe('12345');
    expect(result.checkout.order.orderNumber).toBe('ORD-2024-001');
    expect(result.checkout.order.status).toBe('pending');
    expect(result.checkout.paymentRedirectUrl).toBe(
      'https://payment.example.com/redirect',
    );
    expect(result.checkout.errors).toEqual([]);
  });

  it('should handle order details correctly', async () => {
    const client = new UnchainedGraphQLClient();
    const executor = createCheckoutExecutor(client);

    const result = await executor('Checkout', {
      input: checkoutInput,
    });

    const order = result.checkout.order;
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

    expect(result.checkout.order).toBeDefined();
  });

  it('should process paid checkout with generic provider', async () => {
    const client = new UnchainedGraphQLClient();
    const executor = createCheckoutExecutor(client);

    // Use donation amount to trigger GENERIC provider in mock
    const paidCheckoutInput = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Main St',
      city: 'Anytown',
      postalCode: '12345',
      country: 'US',
      donation: 50, // CHF donation to trigger paid checkout
      successRedirectUrl: 'https://example.com/success',
      cancelRedirectUrl: 'https://example.com/cancel',
      failedRedirectUrl: 'https://example.com/failed',
    };

    const result = await executor('Checkout', {
      input: paidCheckoutInput,
    });

    expect(result).toBeDefined();
    expect(result.checkout).toBeDefined();
    expect(result.checkout.errors).toEqual([]);

    // For GENERIC provider, we should get a redirect URL from the sign operation
    expect(result.checkout.paymentRedirectUrl).toBe(
      'https://unchained-test.payrexx.com/?payment=569af0f32a9e9902a65361a045e62a59',
    );

    // For GENERIC provider, we don't get order details immediately
    expect(result.checkout.order).toBeUndefined();
  });

  it('should handle donations correctly in free checkout', async () => {
    const client = new UnchainedGraphQLClient();
    const executor = createCheckoutExecutor(client);

    // Test with 0 donation - should result in INVOICE provider
    const freeCheckoutWithZeroDonation = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Main St',
      city: 'Anytown',
      postalCode: '12345',
      country: 'US',
      donation: 0, // CHF 0 donation - should be free checkout
    };

    const result = await executor('Checkout', {
      input: freeCheckoutWithZeroDonation,
    });

    expect(result).toBeDefined();
    expect(result.checkout).toBeDefined();
    expect(result.checkout.errors).toEqual([]);

    // For INVOICE provider (free), we should get order details
    expect(result.checkout.order).toBeDefined();
    expect(result.checkout.order.id).toBe('12345');
    expect(result.checkout.paymentRedirectUrl).toBe(
      'https://payment.example.com/redirect',
    );
  });

  it('should handle donations correctly in paid checkout', async () => {
    const client = new UnchainedGraphQLClient();
    const executor = createCheckoutExecutor(client);

    // Test with actual donation amount - should result in GENERIC provider
    const paidCheckoutWithDonation = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Main St',
      city: 'Anytown',
      postalCode: '12345',
      country: 'US',
      donation: 25.5, // CHF 25.50 donation - should trigger paid checkout
      successRedirectUrl: 'https://example.com/success',
      cancelRedirectUrl: 'https://example.com/cancel',
      failedRedirectUrl: 'https://example.com/failed',
    };

    const result = await executor('Checkout', {
      input: paidCheckoutWithDonation,
    });

    expect(result).toBeDefined();
    expect(result.checkout).toBeDefined();
    expect(result.checkout.errors).toEqual([]);

    // For GENERIC provider, we should get a redirect URL from the sign operation
    expect(result.checkout.paymentRedirectUrl).toBe(
      'https://unchained-test.payrexx.com/?payment=569af0f32a9e9902a65361a045e62a59',
    );

    // For GENERIC provider, we don't get order details immediately
    expect(result.checkout.order).toBeUndefined();
  });

  it('should correctly convert CHF donations to cents in API', async () => {
    const client = new UnchainedGraphQLClient();
    const executor = createCheckoutExecutor(client);

    // Test with 200 CHF donation to verify correct currency conversion
    const largeDonationInput = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Main St',
      city: 'Anytown',
      postalCode: '12345',
      country: 'US',
      donation: 200, // CHF 200.00 donation (should become 20000 cents internally)
      successRedirectUrl: 'https://example.com/success',
      cancelRedirectUrl: 'https://example.com/cancel',
      failedRedirectUrl: 'https://example.com/failed',
    };

    const result = await executor('Checkout', {
      input: largeDonationInput,
    });

    expect(result).toBeDefined();
    expect(result.checkout).toBeDefined();
    expect(result.checkout.errors).toEqual([]);

    // Should trigger GENERIC provider for 200 CHF donation
    expect(result.checkout.paymentRedirectUrl).toBe(
      'https://unchained-test.payrexx.com/?payment=569af0f32a9e9902a65361a045e62a59',
    );

    // For GENERIC provider, we don't get order details immediately
    expect(result.checkout.order).toBeUndefined();
  });
});
