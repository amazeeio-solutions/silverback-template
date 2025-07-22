// Generic executor type for any operation
export type Executor<T extends string> = (
  id: T,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vars: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => Promise<{ data: any; error: any }> | { data: any; error: any };

export type UnchainedOperationId =
  | 'Cart'
  | 'AddToCart'
  | 'UpdateCartItem'
  | 'RemoveFromCart'
  | 'ClearCart'
  | 'Checkout'
  | 'GuestLogin';

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
