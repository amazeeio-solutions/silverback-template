import {
  ClearCartMutation as ClearCartMutationId,
  OperationVariables,
} from '@custom/schema';

import { type GraphQLClient, UnchainedGraphQLClient } from '../../client';
import { ClearCartMutation } from '../../operations';
import type { Executor } from '../../types';

/**
 * Creates a session-aware clear-cart executor that automatically handles guest login
 */
export function createSessionAwareClearCartExecutor(
  client: GraphQLClient = new UnchainedGraphQLClient(),
): Executor<typeof ClearCartMutationId> {
  return async (
    id: typeof ClearCartMutationId,
    vars: OperationVariables<typeof ClearCartMutationId>,
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await client.request(ClearCartMutation, vars as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return result as any;
  };
}

/**
 * Default session-aware clear-cart executor that automatically handles guest login
 */
export const sessionAwareClearCartExecutor: Executor<
  typeof ClearCartMutationId
> = createSessionAwareClearCartExecutor();
