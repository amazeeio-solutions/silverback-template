import type { ResultOf, VariablesOf } from 'gql.tada';
import { type DocumentNode, print } from 'graphql';

import { GuestLoginMutation } from './operations';

export interface GraphQLClient {
  // Generic overload for typed DocumentNode from gql.tada
  request<TDocument extends DocumentNode>(
    query: TDocument,
    variables: VariablesOf<TDocument>,
  ): Promise<ResultOf<TDocument>>;

  // Overload for when variables are optional (no variables required)
  request<TDocument extends DocumentNode>(
    query: TDocument,
    variables?: VariablesOf<TDocument> extends Record<string, never>
      ? never
      : VariablesOf<TDocument>,
  ): Promise<ResultOf<TDocument>>;

  // Fallback overload for plain strings (no type checking)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  request<TResult = any, TVariables = any>(
    query: string,
    variables?: TVariables,
  ): Promise<TResult>;
}

export class UnchainedGraphQLClient implements GraphQLClient {
  private endpoint: string;
  private isGuestLoggedIn: boolean = false;
  private loginPromise: Promise<void> | null = null;

  constructor(endpoint: string = 'https://kls.nöd.live/graphql') {
    this.endpoint = endpoint;
  }

  /**
   * Ensures a guest session exists by performing guest login if necessary
   */
  private async ensureGuestLogin(): Promise<void> {
    // If already logged in, return immediately
    if (this.isGuestLoggedIn) {
      return;
    }

    // If login is already in progress, wait for it
    if (this.loginPromise) {
      return this.loginPromise;
    }

    // Start guest login process
    this.loginPromise = this.performGuestLogin();

    try {
      await this.loginPromise;
    } finally {
      this.loginPromise = null;
    }
  }

  /**
   * Performs the actual guest login request
   */
  private async performGuestLogin(): Promise<void> {
    const queryString = print(GuestLoginMutation);

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        query: queryString,
        variables: {},
      }),
    });

    if (!response.ok) {
      throw new Error(`Guest login failed: HTTP ${response.status}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await response.json();

    if (result.errors) {
      throw new Error(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        `Guest login failed: ${result.errors.map((e: any) => e.message).join(', ')}`,
      );
    }

    if (!result.data?.loginAsGuest) {
      throw new Error('Guest login failed: No guest user returned');
    }

    this.isGuestLoggedIn = true;
  }

  /**
   * Helper method to detect if an error indicates authentication is required
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private isAuthenticationError(result: any): boolean {
    if (!result.errors) {
      return false;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return result.errors.some((error: any) => {
      const message = error.message?.toLowerCase() || '';
      const extensions = error.extensions || {};

      // Check for common authentication error patterns
      return (
        message.includes('unauthenticated') ||
        message.includes('authentication required') ||
        message.includes('not authorized') ||
        message.includes('guest session required') ||
        extensions.code === 'UNAUTHENTICATED' ||
        extensions.code === 'AUTHENTICATION_REQUIRED'
      );
    });
  }

  /**
   * Helper method to check if query is the guest login mutation
   */
  private isGuestLoginQuery(query: DocumentNode | string): boolean {
    const queryString = typeof query === 'string' ? query : print(query);
    return queryString.includes('loginAsGuest');
  }

  // Implementation that handles all overloads
  async request<TDocument extends DocumentNode>(
    query: TDocument | string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    variables?: VariablesOf<TDocument> | any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<ResultOf<TDocument> | any> {
    return this.requestWithRetry(query, variables, false);
  }

  /**
   * Internal request method that handles authentication retry logic
   */
  private async requestWithRetry<TDocument extends DocumentNode>(
    query: TDocument | string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    variables?: VariablesOf<TDocument> | any,
    isRetry: boolean = false,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<ResultOf<TDocument> | any> {
    const queryString = typeof query === 'string' ? query : print(query);

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for session management
      body: JSON.stringify({
        query: queryString,
        variables,
      }),
    });

    if (!response.ok) {
      // For HTTP 401, try guest login if not already retrying and not the guest login query itself
      if (
        response.status === 401 &&
        !isRetry &&
        !this.isGuestLoginQuery(query)
      ) {
        await this.ensureGuestLogin();
        return this.requestWithRetry(query, variables, true);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await response.json();

    if (result.errors) {
      // Check for authentication errors and retry with guest login
      if (
        !isRetry &&
        !this.isGuestLoginQuery(query) &&
        this.isAuthenticationError(result)
      ) {
        // Reset login state since we got auth errors
        this.isGuestLoggedIn = false;
        await this.ensureGuestLogin();
        return this.requestWithRetry(query, variables, true);
      }

      throw new Error(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        `GraphQL error: ${result.errors.map((e: any) => e.message).join(', ')}`,
      );
    }

    return result.data;
  }
}

export const defaultClient = new UnchainedGraphQLClient();
