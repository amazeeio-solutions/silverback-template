import type { Response } from 'supertest';
import request from 'supertest';

import type { TestServerInstance } from './server-setup.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    extensions?: Record<string, any>;
  }>;
}

export interface RequestHelpers {
  /**
   * Make a GraphQL query request
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query<T = any>(
    query: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    variables?: Record<string, any>,
  ): Promise<Response & { body: GraphQLResponse<T> }>;

  /**
   * Make a GraphQL mutation request
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mutation<T = any>(
    mutation: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    variables?: Record<string, any>,
  ): Promise<Response & { body: GraphQLResponse<T> }>;

  /**
   * Make a request to the health endpoint
   */
  health(): Promise<Response>;

  /**
   * Make a request to the root endpoint
   */
  root(): Promise<Response>;

  /**
   * Get the underlying supertest agent for custom requests
   */
  agent: ReturnType<typeof request>;
}

/**
 * Creates request helpers for a test server instance
 */
export function createRequestHelpers(
  serverInstance: TestServerInstance,
): RequestHelpers {
  // Create agent that preserves cookies across requests
  const agent = request.agent(serverInstance.app);

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async query<T = any>(
      query: string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      variables?: Record<string, any>,
    ): Promise<Response & { body: GraphQLResponse<T> }> {
      return agent
        .post('/graphql')
        .send({ query, variables })
        .set('Content-Type', 'application/json');
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async mutation<T = any>(
      mutation: string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      variables?: Record<string, any>,
    ): Promise<Response & { body: GraphQLResponse<T> }> {
      return agent
        .post('/graphql')
        .send({ query: mutation, variables })
        .set('Content-Type', 'application/json');
    },

    async health(): Promise<Response> {
      return agent.get('/health');
    },

    async root(): Promise<Response> {
      return agent.get('/');
    },

    agent,
  };
}

// Common GraphQL queries and mutations as constants
export const QUERIES = {
  CART: `
    query Cart {
      cart {
        items {
          uuid
          title
          price
          quantity
          sku
          teaserImage {
            alt
            source
          }
          maxStock
        }
        totalItems
        totalPrice
      }
    }
  `,
};

export const MUTATIONS = {
  GUEST_LOGIN: `
    mutation GuestLogin {
      loginAsGuest {
        _id
        tokenExpires
      }
    }
  `,

  ADD_TO_CART: `
    mutation AddToCart($input: AddToCartInput!) {
      addToCart(input: $input) {
        cart {
          items {
            uuid
            title
            price
            quantity
            sku
            teaserImage {
              alt
              source
            }
            maxStock
          }
          totalItems
          totalPrice
        }
        errors {
          message
          key
          field
        }
      }
    }
  `,

  UPDATE_CART_ITEM: `
    mutation UpdateCartItem($input: UpdateCartItemInput!) {
      updateCartItem(input: $input) {
        cart {
          items {
            uuid
            title
            price
            quantity
            sku
            teaserImage {
              alt
              source
            }
            maxStock
          }
          totalItems
          totalPrice
        }
        errors {
          message
          key
          field
        }
      }
    }
  `,

  REMOVE_FROM_CART: `
    mutation RemoveFromCart($productId: String!) {
      removeFromCart(productId: $productId) {
        cart {
          items {
            uuid
            title
            price
            quantity
            sku
            teaserImage {
              alt
              source
            }
            maxStock
          }
          totalItems
          totalPrice
        }
        errors {
          message
          key
          field
        }
      }
    }
  `,

  CLEAR_CART: `
    mutation ClearCart {
      clearCart {
        cart {
          items {
            uuid
            title
            price
            quantity
            sku
            teaserImage {
              alt
              source
            }
            maxStock
          }
          totalItems
          totalPrice
        }
        errors {
          message
          key
          field
        }
      }
    }
  `,

  CHECKOUT: `
    mutation Checkout($input: CheckoutInput!) {
      checkout(input: $input) {
        order {
          id
          orderNumber
          status
          totalAmount
          items {
            uuid
            title
            price
            quantity
            sku
          }
        }
        errors {
          message
          key
          field
        }
        paymentRedirectUrl
      }
    }
  `,
};

// Type definitions for response data
export interface CartData {
  cart: {
    items: Array<{
      uuid: string;
      title: string;
      price: number;
      quantity: number;
      sku: string;
      teaserImage?: {
        alt?: string;
        source?: string;
      };
      maxStock: number;
    }>;
    totalItems: number;
    totalPrice: number;
  };
}

export interface GuestLoginData {
  loginAsGuest: {
    _id: string;
    tokenExpires: string;
  };
}

export interface CartMutationData {
  [key: string]: {
    cart?: CartData['cart'];
    errors: Array<{
      message: string;
      key?: string;
      field?: string;
    }>;
  };
}

export interface CheckoutData {
  checkout: {
    order?: {
      id: string;
      orderNumber: string;
      status: string;
      totalAmount: number;
      items: Array<{
        uuid: string;
        title: string;
        price: number;
        quantity: number;
        sku: string;
      }>;
    };
    errors: Array<{
      message: string;
      key?: string;
      field?: string;
    }>;
    paymentRedirectUrl?: string;
  };
}
