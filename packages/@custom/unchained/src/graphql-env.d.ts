/* prettier-ignore */

/** An IntrospectionQuery representation of your schema.
 *
 * @remarks
 * This is an introspection of your schema saved as a file by GraphQLSP.
 * It will automatically be used by `gql.tada` to infer the types of your GraphQL documents.
 * If you need to recompile your schema, run `pnpm gql.tada introspect`.
 */
export type introspection = {
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
