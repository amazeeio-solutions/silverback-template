import type {
  AddToCartMutation,
  AnyOperationId,
  CartQuery,
  CheckoutMutation,
  ClearCartMutation,
  OperationResult,
  OperationVariables,
  RemoveFromCartMutation,
  UpdateCartItemMutation,
} from '@custom/schema';

// Generic executor type that uses proper schema types for input/output
export type Executor<T extends AnyOperationId> = (
  id: T,
  vars: OperationVariables<T>,
) => Promise<OperationResult<T>> | OperationResult<T>;

export type UnchainedOperationId =
  | typeof CartQuery
  | typeof AddToCartMutation
  | typeof UpdateCartItemMutation
  | typeof RemoveFromCartMutation
  | typeof ClearCartMutation
  | typeof CheckoutMutation
  | 'UpdateCart' // UpdateCart operation for setting billing address
  | 'GuestLogin'; // Keep GuestLogin as string since it might not be in the schema yet

// Authentication-related error types
export interface AuthenticationError extends Error {
  name: 'AuthenticationError';
  code: 'UNAUTHENTICATED' | 'AUTHENTICATION_REQUIRED' | 'GUEST_LOGIN_FAILED';
}

export interface GuestLoginError extends AuthenticationError {
  code: 'GUEST_LOGIN_FAILED';
}

// Enhanced executor type with better error handling
export type ExecutorResult<T> =
  | {
      data: T;
      error: null;
    }
  | {
      data: null;
      error: Error | AuthenticationError;
    };
