import { defaultClient, type GraphQLClient } from '../client';
import { UpdateCartMutation } from '../operations';
import { handleGraphQLResponse, mapVariablesToGqlTada } from '../utils';

// Internal type for UpdateCart operation (not exposed to schema)
type UpdateCartExecutor = (
  id: 'UpdateCart',
  vars: {
    input: {
      email: string;
      firstName: string;
      lastName: string;
      address?: string;
      city?: string;
      postalCode?: string;
      country?: string;
    };
  },
) => Promise<{ updateCart: unknown }>;

// Create a typed executor that accepts schema variables and returns schema results
export function createUpdateCartExecutor(
  client: GraphQLClient = defaultClient,
): UpdateCartExecutor {
  return async (id: 'UpdateCart', vars) => {
    // Map schema variables to gql.tada variables
    const gqlTadaVars = mapVariablesToGqlTada(UpdateCartMutation, vars);
    const response = await client.request(UpdateCartMutation, gqlTadaVars);
    const data = handleGraphQLResponse(response);
    // Return the data directly since this is a new operation not in schema
    return { updateCart: data.updateCart };
  };
}

export const updateCartExecutor: UpdateCartExecutor =
  createUpdateCartExecutor();
