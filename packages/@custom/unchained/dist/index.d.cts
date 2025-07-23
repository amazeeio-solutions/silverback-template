import {
  AnyOperationId,
  OperationVariables,
  OperationResult,
  CartQuery as CartQuery$1,
  AddToCartMutation as AddToCartMutation$1,
  UpdateCartItemMutation as UpdateCartItemMutation$1,
  RemoveFromCartMutation as RemoveFromCartMutation$1,
  ClearCartMutation as ClearCartMutation$1,
  CheckoutMutation as CheckoutMutation$1,
} from '@custom/schema';
import * as gql_tada from 'gql.tada';
import { VariablesOf, ResultOf, initGraphQLTada } from 'gql.tada';
export { readFragment } from 'gql.tada';
import { DocumentNode } from 'graphql';

interface GraphQLClient {
  request<TDocument extends DocumentNode>(
    query: TDocument,
    variables: VariablesOf<TDocument>,
  ): Promise<ResultOf<TDocument>>;
  request<TDocument extends DocumentNode>(
    query: TDocument,
    variables?: VariablesOf<TDocument> extends Record<string, never>
      ? never
      : VariablesOf<TDocument>,
  ): Promise<ResultOf<TDocument>>;
  request<TResult = any, TVariables = any>(
    query: string,
    variables?: TVariables,
  ): Promise<TResult>;
}
declare class UnchainedGraphQLClient implements GraphQLClient {
  private endpoint;
  private isGuestLoggedIn;
  private loginPromise;
  constructor(endpoint?: string);
  /**
   * Ensures a guest session exists by performing guest login if necessary
   */
  private ensureGuestLogin;
  /**
   * Performs the actual guest login request
   */
  private performGuestLogin;
  /**
   * Helper method to detect if an error indicates authentication is required
   */
  private isAuthenticationError;
  /**
   * Helper method to check if query is the guest login mutation
   */
  private isGuestLoginQuery;
  request<TDocument extends DocumentNode>(
    query: TDocument | string,
    variables?: VariablesOf<TDocument> | any,
  ): Promise<ResultOf<TDocument> | any>;
  /**
   * Internal request method that handles authentication retry logic
   */
  private requestWithRetry;
}
declare const defaultClient: UnchainedGraphQLClient;

type Executor<T extends AnyOperationId> = (
  id: T,
  vars: OperationVariables<T>,
) =>
  | Promise<{
      data: OperationResult<T>;
      error: any;
    }>
  | {
      data: OperationResult<T>;
      error: any;
    };
type UnchainedOperationId =
  | typeof CartQuery$1
  | typeof AddToCartMutation$1
  | typeof UpdateCartItemMutation$1
  | typeof RemoveFromCartMutation$1
  | typeof ClearCartMutation$1
  | typeof CheckoutMutation$1
  | 'GuestLogin';

declare function createCartExecutor(
  client?: GraphQLClient,
): Executor<typeof CartQuery$1>;
declare const cartExecutor: Executor<typeof CartQuery$1>;

declare function createAddToCartExecutor(
  client?: GraphQLClient,
): Executor<typeof AddToCartMutation$1>;
declare const addToCartExecutor: Executor<typeof AddToCartMutation$1>;

declare function createUpdateCartItemExecutor(
  client?: GraphQLClient,
): Executor<typeof UpdateCartItemMutation$1>;
declare const updateCartItemExecutor: Executor<typeof UpdateCartItemMutation$1>;

declare function createRemoveFromCartExecutor(
  client?: GraphQLClient,
): Executor<typeof RemoveFromCartMutation$1>;
declare const removeFromCartExecutor: Executor<typeof RemoveFromCartMutation$1>;

declare function createClearCartExecutor(
  client?: GraphQLClient,
): Executor<typeof ClearCartMutation$1>;
declare const clearCartExecutor: Executor<typeof ClearCartMutation$1>;

declare function createCheckoutExecutor(
  client?: GraphQLClient,
): Executor<typeof CheckoutMutation$1>;
declare const checkoutExecutor: Executor<typeof CheckoutMutation$1>;

declare function createGuestLoginExecutor(client?: GraphQLClient): any;
declare const guestLoginExecutor: any;

/**
 * Creates a session-aware cart executor that automatically handles guest login
 */
declare function createSessionAwareCartExecutor(
  client?: GraphQLClient,
): Executor<typeof CartQuery$1>;
/**
 * Default session-aware cart executor that automatically handles guest login
 */
declare const sessionAwareCartExecutor: Executor<typeof CartQuery$1>;

/**
 * Creates a session-aware add-to-cart executor that automatically handles guest login
 */
declare function createSessionAwareAddToCartExecutor(
  client?: GraphQLClient,
): Executor<typeof AddToCartMutation$1>;
/**
 * Default session-aware add-to-cart executor that automatically handles guest login
 */
declare const sessionAwareAddToCartExecutor: Executor<
  typeof AddToCartMutation$1
>;

/**
 * Creates a session-aware update-cart-item executor that automatically handles guest login
 */
declare function createSessionAwareUpdateCartItemExecutor(
  client?: GraphQLClient,
): Executor<typeof UpdateCartItemMutation$1>;
/**
 * Default session-aware update-cart-item executor that automatically handles guest login
 */
declare const sessionAwareUpdateCartItemExecutor: Executor<
  typeof UpdateCartItemMutation$1
>;

/**
 * Creates a session-aware remove-from-cart executor that automatically handles guest login
 */
declare function createSessionAwareRemoveFromCartExecutor(
  client?: GraphQLClient,
): Executor<typeof RemoveFromCartMutation$1>;
/**
 * Default session-aware remove-from-cart executor that automatically handles guest login
 */
declare const sessionAwareRemoveFromCartExecutor: Executor<
  typeof RemoveFromCartMutation$1
>;

/**
 * Creates a session-aware clear-cart executor that automatically handles guest login
 */
declare function createSessionAwareClearCartExecutor(
  client?: GraphQLClient,
): Executor<typeof ClearCartMutation$1>;
/**
 * Default session-aware clear-cart executor that automatically handles guest login
 */
declare const sessionAwareClearCartExecutor: Executor<
  typeof ClearCartMutation$1
>;

/**
 * Creates a session-aware checkout executor that automatically handles guest login
 */
declare function createSessionAwareCheckoutExecutor(
  client?: GraphQLClient,
): Executor<typeof CheckoutMutation$1>;
/**
 * Default session-aware checkout executor that automatically handles guest login
 */
declare const sessionAwareCheckoutExecutor: Executor<typeof CheckoutMutation$1>;

/* prettier-ignore */

/** An IntrospectionQuery representation of your schema.
 *
 * @remarks
 * This is an introspection of your schema saved as a file by GraphQLSP.
 * It will automatically be used by `gql.tada` to infer the types of your GraphQL documents.
 * If you need to recompile your schema, run `pnpm gql.tada introspect`.
 */
type introspection = {
  __schema: {
    queryType: {
      name: 'Query';
    };
    mutationType: {
      name: 'Mutation';
    };
    subscriptionType: null;
    types: readonly [
      {
        kind: 'OBJECT';
        name: 'Query';
        fields: readonly [
          {
            name: 'cart';
            type: {
              kind: 'OBJECT';
              name: 'Cart';
            };
          }
        ];
      },
      {
        kind: 'OBJECT';
        name: 'Mutation';
        fields: readonly [
          {
            name: 'addToCart';
            type: {
              kind: 'OBJECT';
              name: 'AddToCartResult';
            };
            args: readonly [
              {
                name: 'input';
                type: {
                  kind: 'NON_NULL';
                  ofType: {
                    kind: 'INPUT_OBJECT';
                    name: 'AddToCartInput';
                  };
                };
              }
            ];
          },
          {
            name: 'updateCartItem';
            type: {
              kind: 'OBJECT';
              name: 'UpdateCartItemResult';
            };
            args: readonly [
              {
                name: 'input';
                type: {
                  kind: 'NON_NULL';
                  ofType: {
                    kind: 'INPUT_OBJECT';
                    name: 'UpdateCartItemInput';
                  };
                };
              }
            ];
          },
          {
            name: 'removeFromCart';
            type: {
              kind: 'OBJECT';
              name: 'RemoveFromCartResult';
            };
            args: readonly [
              {
                name: 'productId';
                type: {
                  kind: 'NON_NULL';
                  ofType: {
                    kind: 'SCALAR';
                    name: 'String';
                  };
                };
              }
            ];
          },
          {
            name: 'clearCart';
            type: {
              kind: 'OBJECT';
              name: 'ClearCartResult';
            };
          },
          {
            name: 'checkout';
            type: {
              kind: 'OBJECT';
              name: 'CheckoutResult';
            };
            args: readonly [
              {
                name: 'input';
                type: {
                  kind: 'NON_NULL';
                  ofType: {
                    kind: 'INPUT_OBJECT';
                    name: 'CheckoutInput';
                  };
                };
              }
            ];
          }
        ];
      },
      {
        kind: 'OBJECT';
        name: 'Cart';
        fields: readonly [
          {
            name: 'items';
            type: {
              kind: 'LIST';
              ofType: {
                kind: 'OBJECT';
                name: 'CartItem';
              };
            };
          },
          {
            name: 'totalItems';
            type: {
              kind: 'SCALAR';
              name: 'Int';
            };
          },
          {
            name: 'totalPrice';
            type: {
              kind: 'SCALAR';
              name: 'Float';
            };
          }
        ];
      },
      {
        kind: 'OBJECT';
        name: 'CartItem';
        fields: readonly [
          {
            name: 'id';
            type: {
              kind: 'SCALAR';
              name: 'ID';
            };
          },
          {
            name: 'title';
            type: {
              kind: 'SCALAR';
              name: 'String';
            };
          },
          {
            name: 'price';
            type: {
              kind: 'SCALAR';
              name: 'Float';
            };
          },
          {
            name: 'quantity';
            type: {
              kind: 'SCALAR';
              name: 'Int';
            };
          },
          {
            name: 'sku';
            type: {
              kind: 'SCALAR';
              name: 'String';
            };
          },
          {
            name: 'teaserImage';
            type: {
              kind: 'OBJECT';
              name: 'Image';
            };
          },
          {
            name: 'maxStock';
            type: {
              kind: 'SCALAR';
              name: 'Int';
            };
          }
        ];
      },
      {
        kind: 'OBJECT';
        name: 'Image';
        fields: readonly [
          {
            name: 'alt';
            type: {
              kind: 'SCALAR';
              name: 'String';
            };
          },
          {
            name: 'source';
            type: {
              kind: 'SCALAR';
              name: 'String';
            };
          }
        ];
      },
      {
        kind: 'INPUT_OBJECT';
        name: 'AddToCartInput';
        inputFields: readonly [
          {
            name: 'productId';
            type: {
              kind: 'NON_NULL';
              ofType: {
                kind: 'SCALAR';
                name: 'String';
              };
            };
          },
          {
            name: 'quantity';
            type: {
              kind: 'SCALAR';
              name: 'Int';
            };
          }
        ];
      },
      {
        kind: 'INPUT_OBJECT';
        name: 'UpdateCartItemInput';
        inputFields: readonly [
          {
            name: 'itemId';
            type: {
              kind: 'NON_NULL';
              ofType: {
                kind: 'SCALAR';
                name: 'String';
              };
            };
          },
          {
            name: 'quantity';
            type: {
              kind: 'NON_NULL';
              ofType: {
                kind: 'SCALAR';
                name: 'Int';
              };
            };
          }
        ];
      },
      {
        kind: 'INPUT_OBJECT';
        name: 'CheckoutInput';
        inputFields: readonly [
          {
            name: 'email';
            type: {
              kind: 'NON_NULL';
              ofType: {
                kind: 'SCALAR';
                name: 'String';
              };
            };
          },
          {
            name: 'firstName';
            type: {
              kind: 'NON_NULL';
              ofType: {
                kind: 'SCALAR';
                name: 'String';
              };
            };
          },
          {
            name: 'lastName';
            type: {
              kind: 'NON_NULL';
              ofType: {
                kind: 'SCALAR';
                name: 'String';
              };
            };
          },
          {
            name: 'address';
            type: {
              kind: 'SCALAR';
              name: 'String';
            };
          },
          {
            name: 'city';
            type: {
              kind: 'SCALAR';
              name: 'String';
            };
          },
          {
            name: 'postalCode';
            type: {
              kind: 'SCALAR';
              name: 'String';
            };
          },
          {
            name: 'country';
            type: {
              kind: 'SCALAR';
              name: 'String';
            };
          }
        ];
      },
      {
        kind: 'OBJECT';
        name: 'AddToCartResult';
        fields: readonly [
          {
            name: 'cart';
            type: {
              kind: 'OBJECT';
              name: 'Cart';
            };
          },
          {
            name: 'errors';
            type: {
              kind: 'LIST';
              ofType: {
                kind: 'OBJECT';
                name: 'Error';
              };
            };
          }
        ];
      },
      {
        kind: 'OBJECT';
        name: 'UpdateCartItemResult';
        fields: readonly [
          {
            name: 'cart';
            type: {
              kind: 'OBJECT';
              name: 'Cart';
            };
          },
          {
            name: 'errors';
            type: {
              kind: 'LIST';
              ofType: {
                kind: 'OBJECT';
                name: 'Error';
              };
            };
          }
        ];
      },
      {
        kind: 'OBJECT';
        name: 'RemoveFromCartResult';
        fields: readonly [
          {
            name: 'cart';
            type: {
              kind: 'OBJECT';
              name: 'Cart';
            };
          },
          {
            name: 'errors';
            type: {
              kind: 'LIST';
              ofType: {
                kind: 'OBJECT';
                name: 'Error';
              };
            };
          }
        ];
      },
      {
        kind: 'OBJECT';
        name: 'ClearCartResult';
        fields: readonly [
          {
            name: 'cart';
            type: {
              kind: 'OBJECT';
              name: 'Cart';
            };
          },
          {
            name: 'errors';
            type: {
              kind: 'LIST';
              ofType: {
                kind: 'OBJECT';
                name: 'Error';
              };
            };
          }
        ];
      },
      {
        kind: 'OBJECT';
        name: 'CheckoutResult';
        fields: readonly [
          {
            name: 'order';
            type: {
              kind: 'OBJECT';
              name: 'Order';
            };
          },
          {
            name: 'errors';
            type: {
              kind: 'LIST';
              ofType: {
                kind: 'OBJECT';
                name: 'Error';
              };
            };
          },
          {
            name: 'paymentRedirectUrl';
            type: {
              kind: 'SCALAR';
              name: 'String';
            };
          }
        ];
      },
      {
        kind: 'OBJECT';
        name: 'Order';
        fields: readonly [
          {
            name: 'id';
            type: {
              kind: 'SCALAR';
              name: 'ID';
            };
          },
          {
            name: 'orderNumber';
            type: {
              kind: 'SCALAR';
              name: 'String';
            };
          },
          {
            name: 'status';
            type: {
              kind: 'SCALAR';
              name: 'String';
            };
          },
          {
            name: 'totalAmount';
            type: {
              kind: 'SCALAR';
              name: 'Float';
            };
          },
          {
            name: 'items';
            type: {
              kind: 'LIST';
              ofType: {
                kind: 'OBJECT';
                name: 'OrderItem';
              };
            };
          }
        ];
      },
      {
        kind: 'OBJECT';
        name: 'OrderItem';
        fields: readonly [
          {
            name: 'id';
            type: {
              kind: 'SCALAR';
              name: 'ID';
            };
          },
          {
            name: 'title';
            type: {
              kind: 'SCALAR';
              name: 'String';
            };
          },
          {
            name: 'price';
            type: {
              kind: 'SCALAR';
              name: 'Float';
            };
          },
          {
            name: 'quantity';
            type: {
              kind: 'SCALAR';
              name: 'Int';
            };
          },
          {
            name: 'sku';
            type: {
              kind: 'SCALAR';
              name: 'String';
            };
          }
        ];
      },
      {
        kind: 'OBJECT';
        name: 'Error';
        fields: readonly [
          {
            name: 'message';
            type: {
              kind: 'SCALAR';
              name: 'String';
            };
          }
        ];
      },
      {
        kind: 'SCALAR';
        name: 'ID';
      },
      {
        kind: 'SCALAR';
        name: 'String';
      },
      {
        kind: 'SCALAR';
        name: 'Boolean';
      },
      {
        kind: 'SCALAR';
        name: 'Int';
      },
      {
        kind: 'SCALAR';
        name: 'Float';
      }
    ];
  };
};

declare const graphql: initGraphQLTada<{
  introspection: introspection;
  scalars: {
    ID: string;
    String: string;
    Boolean: boolean;
    Int: number;
    Float: number;
    DateTime: string;
    JSON: any;
  };
}>;

declare const CartQuery: gql_tada.TadaDocumentNode<
  {
    cart: {
      items:
        | ({
            id: string | null;
            title: string | null;
            price: number | null;
            quantity: number | null;
            sku: string | null;
            teaserImage: {
              alt: string | null;
              source: string | null;
            } | null;
            maxStock: number | null;
          } | null)[]
        | null;
      totalItems: number | null;
      totalPrice: number | null;
    } | null;
  },
  {},
  void
>;
declare const AddToCartMutation: gql_tada.TadaDocumentNode<
  {
    addToCart: {
      cart: {
        items:
          | ({
              id: string | null;
              title: string | null;
              price: number | null;
              quantity: number | null;
              sku: string | null;
              teaserImage: {
                alt: string | null;
                source: string | null;
              } | null;
              maxStock: number | null;
            } | null)[]
          | null;
        totalItems: number | null;
        totalPrice: number | null;
      } | null;
      errors:
        | ({
            message: string | null;
          } | null)[]
        | null;
    } | null;
  },
  {
    input: {
      quantity?: number | null | undefined;
      productId: string;
    };
  },
  void
>;
declare const UpdateCartItemMutation: gql_tada.TadaDocumentNode<
  {
    updateCartItem: {
      cart: {
        items:
          | ({
              id: string | null;
              title: string | null;
              price: number | null;
              quantity: number | null;
              sku: string | null;
              teaserImage: {
                alt: string | null;
                source: string | null;
              } | null;
              maxStock: number | null;
            } | null)[]
          | null;
        totalItems: number | null;
        totalPrice: number | null;
      } | null;
      errors:
        | ({
            message: string | null;
          } | null)[]
        | null;
    } | null;
  },
  {
    input: {
      quantity: number;
      itemId: string;
    };
  },
  void
>;
declare const RemoveFromCartMutation: gql_tada.TadaDocumentNode<
  {
    removeFromCart: {
      cart: {
        items:
          | ({
              id: string | null;
              title: string | null;
              price: number | null;
              quantity: number | null;
              sku: string | null;
              teaserImage: {
                alt: string | null;
                source: string | null;
              } | null;
              maxStock: number | null;
            } | null)[]
          | null;
        totalItems: number | null;
        totalPrice: number | null;
      } | null;
      errors:
        | ({
            message: string | null;
          } | null)[]
        | null;
    } | null;
  },
  {
    productId: string;
  },
  void
>;
declare const ClearCartMutation: gql_tada.TadaDocumentNode<
  {
    clearCart: {
      cart: {
        items:
          | ({
              id: string | null;
              title: string | null;
              price: number | null;
              quantity: number | null;
              sku: string | null;
              teaserImage: {
                alt: string | null;
                source: string | null;
              } | null;
              maxStock: number | null;
            } | null)[]
          | null;
        totalItems: number | null;
        totalPrice: number | null;
      } | null;
      errors:
        | ({
            message: string | null;
          } | null)[]
        | null;
    } | null;
  },
  {},
  void
>;
declare const CheckoutMutation: gql_tada.TadaDocumentNode<
  {
    checkout: {
      order: {
        id: string | null;
        orderNumber: string | null;
        status: string | null;
        totalAmount: number | null;
        items:
          | ({
              id: string | null;
              title: string | null;
              price: number | null;
              quantity: number | null;
              sku: string | null;
            } | null)[]
          | null;
      } | null;
      errors:
        | ({
            message: string | null;
          } | null)[]
        | null;
      paymentRedirectUrl: string | null;
    } | null;
  },
  {
    input: {
      country?: string | null | undefined;
      postalCode?: string | null | undefined;
      city?: string | null | undefined;
      address?: string | null | undefined;
      lastName: string;
      firstName: string;
      email: string;
    };
  },
  void
>;
declare const GuestLoginMutation: gql_tada.TadaDocumentNode<
  {
    loginAsGuest: unknown;
  },
  {},
  void
>;

export {
  AddToCartMutation,
  CartQuery,
  CheckoutMutation,
  ClearCartMutation,
  type Executor,
  type GraphQLClient,
  GuestLoginMutation,
  RemoveFromCartMutation,
  UnchainedGraphQLClient,
  type UnchainedOperationId,
  UpdateCartItemMutation,
  addToCartExecutor,
  cartExecutor,
  checkoutExecutor,
  clearCartExecutor,
  createAddToCartExecutor,
  createCartExecutor,
  createCheckoutExecutor,
  createClearCartExecutor,
  createGuestLoginExecutor,
  createRemoveFromCartExecutor,
  createSessionAwareAddToCartExecutor,
  createSessionAwareCartExecutor,
  createSessionAwareCheckoutExecutor,
  createSessionAwareClearCartExecutor,
  createSessionAwareRemoveFromCartExecutor,
  createSessionAwareUpdateCartItemExecutor,
  createUpdateCartItemExecutor,
  defaultClient,
  graphql,
  guestLoginExecutor,
  removeFromCartExecutor,
  sessionAwareAddToCartExecutor,
  sessionAwareCartExecutor,
  sessionAwareCheckoutExecutor,
  sessionAwareClearCartExecutor,
  sessionAwareRemoveFromCartExecutor,
  sessionAwareUpdateCartItemExecutor,
  updateCartItemExecutor,
};
