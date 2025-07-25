import type { ResultOf } from 'gql.tada';

import { defaultClient, type GraphQLClient } from '../client';
import { GuestLoginMutation } from '../operations';
import { type GuestLoginResult,handleGraphQLResponse, mapGuestLoginResult } from '../utils';

// Guest login executor type since it's not yet in the schema
export type GuestLoginExecutor = (
  id: 'GuestLogin',
  vars?: Record<string, never>,
) => Promise<GuestLoginResult>;

export function createGuestLoginExecutor(
  client: GraphQLClient = defaultClient,
): GuestLoginExecutor {
  return async (id: 'GuestLogin', vars) => {
    // Guest login mutation has no variables, pass empty object if vars is undefined
    const response = await client.request(GuestLoginMutation, vars || {});
    const data = handleGraphQLResponse(response);
    // Map gql.tada result to a consistent result type - cast to expected type
    return mapGuestLoginResult(data as ResultOf<typeof GuestLoginMutation>);
  };
}

export const guestLoginExecutor = createGuestLoginExecutor();
