import {
  OperationVariables,
  UpdateCartItemMutation as UpdateCartItemMutationId,
} from '@custom/schema';

import { defaultClient, type GraphQLClient } from '../client';
import { UpdateCartItemMutation } from '../operations';
import type { Executor } from '../types';

export function createUpdateCartItemExecutor(
  client: GraphQLClient = defaultClient,
): Executor<typeof UpdateCartItemMutationId> {
  return async (
    id: typeof UpdateCartItemMutationId,
    vars: OperationVariables<typeof UpdateCartItemMutationId>,
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await client.request(UpdateCartItemMutation, vars as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return result as any;
  };
}

export const updateCartItemExecutor: Executor<typeof UpdateCartItemMutationId> =
  createUpdateCartItemExecutor();
