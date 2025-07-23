import { defaultClient, type GraphQLClient } from '../client';
import { GuestLoginMutation } from '../operations';

export function createGuestLoginExecutor(
  client: GraphQLClient = defaultClient,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async (id: 'GuestLogin', vars: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await client.request(GuestLoginMutation, vars as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { data: result as any, error: null };
  };
}

export const guestLoginExecutor = createGuestLoginExecutor();
