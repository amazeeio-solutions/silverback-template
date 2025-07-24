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
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = await client.request(UpdateCartItemMutation, vars as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { data: data as any, error: null };
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { data: null as any, error: error as Error };
    }
  };
}

export const updateCartItemExecutor: Executor<typeof UpdateCartItemMutationId> =
  createUpdateCartItemExecutor();
