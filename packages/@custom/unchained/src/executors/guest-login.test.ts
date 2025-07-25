import { describe, expect, it } from 'vitest';

import { UnchainedGraphQLClient } from '../client';
import { createGuestLoginExecutor } from './guest-login';

describe('guestLoginExecutor', () => {
  it('should login as guest successfully', async () => {
    const client = new UnchainedGraphQLClient();
    const executor = createGuestLoginExecutor(client);

    const result = await executor('GuestLogin', {});

    expect(result).toBeDefined();
    expect(result.loginAsGuest).toBeDefined();
    expect(result.loginAsGuest._id).toBe('guest-user-123');
    expect(result.loginAsGuest.tokenExpires).toBeDefined();
  });

  it('should handle guest login response correctly', async () => {
    const client = new UnchainedGraphQLClient();
    const executor = createGuestLoginExecutor(client);

    const result = await executor('GuestLogin', {});

    const guestUser = result.loginAsGuest;
    expect(guestUser._id).toBe('guest-user-123');
    expect(typeof guestUser.tokenExpires).toBe('string');
    expect(guestUser.tokenExpires).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
    ); // ISO date format
  });
});
