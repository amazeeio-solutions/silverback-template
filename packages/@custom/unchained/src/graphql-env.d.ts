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
            name: 'me';
            type: {
              kind: 'OBJECT';
              name: 'User';
            };
          }
        ];
      },
      {
        kind: 'OBJECT';
        name: 'User';
        fields: readonly [
          {
            name: 'cart';
            type: {
              kind: 'OBJECT';
              name: 'Order';
            };
            args: readonly [
              {
                name: 'orderNumber';
                type: {
                  kind: 'SCALAR';
                  name: 'String';
                };
              }
            ];
          }
        ];
      },
      {
        kind: 'OBJECT';
        name: 'Mutation';
        fields: readonly [
          {
            name: 'addCartProduct';
            type: {
              kind: 'NON_NULL';
              ofType: {
                kind: 'OBJECT';
                name: 'OrderItem';
              };
            };
            args: readonly [
              {
                name: 'orderId';
                type: {
                  kind: 'SCALAR';
                  name: 'ID';
                };
              },
              {
                name: 'productId';
                type: {
                  kind: 'NON_NULL';
                  ofType: {
                    kind: 'SCALAR';
                    name: 'ID';
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
            name: 'updateCartItem';
            type: {
              kind: 'NON_NULL';
              ofType: {
                kind: 'OBJECT';
                name: 'OrderItem';
              };
            };
            args: readonly [
              {
                name: 'itemId';
                type: {
                  kind: 'NON_NULL';
                  ofType: {
                    kind: 'SCALAR';
                    name: 'ID';
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
            name: 'removeCartItem';
            type: {
              kind: 'NON_NULL';
              ofType: {
                kind: 'OBJECT';
                name: 'OrderItem';
              };
            };
            args: readonly [
              {
                name: 'itemId';
                type: {
                  kind: 'NON_NULL';
                  ofType: {
                    kind: 'SCALAR';
                    name: 'ID';
                  };
                };
              }
            ];
          },
          {
            name: 'emptyCart';
            type: {
              kind: 'OBJECT';
              name: 'Order';
            };
            args: readonly [
              {
                name: 'orderId';
                type: {
                  kind: 'SCALAR';
                  name: 'ID';
                };
              }
            ];
          },
          {
            name: 'checkoutCart';
            type: {
              kind: 'NON_NULL';
              ofType: {
                kind: 'OBJECT';
                name: 'Order';
              };
            };
            args: readonly [
              {
                name: 'orderId';
                type: {
                  kind: 'SCALAR';
                  name: 'ID';
                };
              },
              {
                name: 'paymentContext';
                type: {
                  kind: 'SCALAR';
                  name: 'JSON';
                };
              },
              {
                name: 'deliveryContext';
                type: {
                  kind: 'SCALAR';
                  name: 'JSON';
                };
              }
            ];
          },
          {
            name: 'loginAsGuest';
            type: {
              kind: 'OBJECT';
              name: 'LoginMethodResponse';
            };
          }
        ];
      },
      {
        kind: 'OBJECT';
        name: 'Order';
        fields: readonly [
          {
            name: '_id';
            type: {
              kind: 'NON_NULL';
              ofType: {
                kind: 'SCALAR';
                name: 'ID';
              };
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
              name: 'OrderStatus';
            };
          },
          {
            name: 'items';
            type: {
              kind: 'NON_NULL';
              ofType: {
                kind: 'LIST';
                ofType: {
                  kind: 'NON_NULL';
                  ofType: {
                    kind: 'OBJECT';
                    name: 'OrderItem';
                  };
                };
              };
            };
          },
          {
            name: 'total';
            type: {
              kind: 'OBJECT';
              name: 'Price';
            };
            args: readonly [
              {
                name: 'category';
                type: {
                  kind: 'SCALAR';
                  name: 'OrderPriceCategory';
                };
              },
              {
                name: 'useNetPrice';
                type: {
                  kind: 'SCALAR';
                  name: 'Boolean';
                };
              }
            ];
          }
        ];
      },
      {
        kind: 'OBJECT';
        name: 'OrderItem';
        fields: readonly [
          {
            name: '_id';
            type: {
              kind: 'NON_NULL';
              ofType: {
                kind: 'SCALAR';
                name: 'ID';
              };
            };
          },
          {
            name: 'product';
            type: {
              kind: 'NON_NULL';
              ofType: {
                kind: 'INTERFACE';
                name: 'Product';
              };
            };
          },
          {
            name: 'originalProduct';
            type: {
              kind: 'NON_NULL';
              ofType: {
                kind: 'INTERFACE';
                name: 'Product';
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
          },
          {
            name: 'unitPrice';
            type: {
              kind: 'OBJECT';
              name: 'Price';
            };
            args: readonly [
              {
                name: 'useNetPrice';
                type: {
                  kind: 'SCALAR';
                  name: 'Boolean';
                };
              }
            ];
          }
        ];
      },
      {
        kind: 'INTERFACE';
        name: 'Product';
        fields: readonly [
          {
            name: '_id';
            type: {
              kind: 'NON_NULL';
              ofType: {
                kind: 'SCALAR';
                name: 'ID';
              };
            };
          },
          {
            name: 'texts';
            type: {
              kind: 'OBJECT';
              name: 'ProductTexts';
            };
            args: readonly [
              {
                name: 'forceLocale';
                type: {
                  kind: 'SCALAR';
                  name: 'Locale';
                };
              }
            ];
          },
          {
            name: 'media';
            type: {
              kind: 'NON_NULL';
              ofType: {
                kind: 'LIST';
                ofType: {
                  kind: 'NON_NULL';
                  ofType: {
                    kind: 'OBJECT';
                    name: 'ProductMedia';
                  };
                };
              };
            };
            args: readonly [
              {
                name: 'limit';
                type: {
                  kind: 'SCALAR';
                  name: 'Int';
                };
              },
              {
                name: 'offset';
                type: {
                  kind: 'SCALAR';
                  name: 'Int';
                };
              },
              {
                name: 'tags';
                type: {
                  kind: 'LIST';
                  ofType: {
                    kind: 'NON_NULL';
                    ofType: {
                      kind: 'SCALAR';
                      name: 'LowerCaseString';
                    };
                  };
                };
              }
            ];
          }
        ];
      },
      {
        kind: 'OBJECT';
        name: 'ProductTexts';
        fields: readonly [
          {
            name: 'title';
            type: {
              kind: 'SCALAR';
              name: 'String';
            };
          }
        ];
      },
      {
        kind: 'OBJECT';
        name: 'ProductMedia';
        fields: readonly [
          {
            name: 'file';
            type: {
              kind: 'OBJECT';
              name: 'Media';
            };
          }
        ];
      },
      {
        kind: 'OBJECT';
        name: 'Media';
        fields: readonly [
          {
            name: 'url';
            type: {
              kind: 'SCALAR';
              name: 'String';
            };
            args: readonly [
              {
                name: 'version';
                type: {
                  kind: 'SCALAR';
                  name: 'String';
                };
              },
              {
                name: 'baseUrl';
                type: {
                  kind: 'SCALAR';
                  name: 'String';
                };
              }
            ];
          }
        ];
      },
      {
        kind: 'OBJECT';
        name: 'Price';
        fields: readonly [
          {
            name: 'amount';
            type: {
              kind: 'NON_NULL';
              ofType: {
                kind: 'SCALAR';
                name: 'Int';
              };
            };
          },
          {
            name: 'currencyCode';
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
        kind: 'OBJECT';
        name: 'LoginMethodResponse';
        fields: readonly [
          {
            name: '_id';
            type: {
              kind: 'NON_NULL';
              ofType: {
                kind: 'SCALAR';
                name: 'String';
              };
            };
          },
          {
            name: 'tokenExpires';
            type: {
              kind: 'NON_NULL';
              ofType: {
                kind: 'SCALAR';
                name: 'DateTimeISO';
              };
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
      },
      {
        kind: 'SCALAR';
        name: 'JSON';
      },
      {
        kind: 'SCALAR';
        name: 'DateTimeISO';
      },
      {
        kind: 'SCALAR';
        name: 'Locale';
      },
      {
        kind: 'SCALAR';
        name: 'LowerCaseString';
      },
      {
        kind: 'ENUM';
        name: 'OrderStatus';
        enumValues: readonly [
          {
            name: 'OPEN';
          },
          {
            name: 'PENDING';
          },
          {
            name: 'REJECTED';
          },
          {
            name: 'CONFIRMED';
          },
          {
            name: 'FULLFILLED';
          }
        ];
      },
      {
        kind: 'ENUM';
        name: 'OrderPriceCategory';
        enumValues: readonly [
          {
            name: 'ITEMS';
          },
          {
            name: 'PAYMENT';
          },
          {
            name: 'DELIVERY';
          },
          {
            name: 'TAXES';
          },
          {
            name: 'DISCOUNTS';
          }
        ];
      }
    ];
  };
};
