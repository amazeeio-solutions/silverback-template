import { describe, expect, it } from 'vitest';

import { UnchainedGraphQLClient } from '../client';
import { createGuestLoginExecutor } from './guest-login';

describe('guestLoginExecutor', () => {
  it('should login as guest successfully', async () => {
    const client = new UnchainedGraphQLClient();
    const executor = createGuestLoginExecutor(client);

    const result = await executor('GuestLogin', {});

    expect(result.data).toBeDefined();
    expect(result.data.loginAsGuest).toBeDefined();
    expect(result.data.loginAsGuest._id).toBe('guest-user-123');
    expect(result.data.loginAsGuest.tokenExpires).toBeDefined();
    expect(result.error).toBeNull();
  });

  it('should handle guest login response correctly', async () => {
    const client = new UnchainedGraphQLClient();
    const executor = createGuestLoginExecutor(client);

    const result = await executor('GuestLogin', {});

    const guestUser = result.data.loginAsGuest;
    expect(guestUser._id).toBe('guest-user-123');
    expect(typeof guestUser.tokenExpires).toBe('string');
    expect(guestUser.tokenExpires).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
    ); // ISO date format
  });
});
