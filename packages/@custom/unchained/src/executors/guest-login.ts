import { defaultClient, type GraphQLClient } from '../client';
import { GuestLoginMutation } from '../operations';

export function createGuestLoginExecutor(
  client: GraphQLClient = defaultClient,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async (id: 'GuestLogin', vars: any) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = await client.request(GuestLoginMutation, vars as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { data: data as any, error: null };
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { data: null as any, error: error as Error };
    }
  };
}

export const guestLoginExecutor = createGuestLoginExecutor();
