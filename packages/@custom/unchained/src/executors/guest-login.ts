import { defaultClient, type GraphQLClient } from '../client';
import { GuestLoginMutation } from '../operations';
import type { Executor } from '../types';

export function createGuestLoginExecutor(
  client: GraphQLClient = defaultClient,
): Executor<'GuestLogin'> {
  return async (id: 'GuestLogin', vars: {}) => {
    const result = await client.request(GuestLoginMutation, vars);
    return { data: result, error: null };
  };
}

export const guestLoginExecutor = createGuestLoginExecutor();
