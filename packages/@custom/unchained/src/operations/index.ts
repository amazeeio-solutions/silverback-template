import { graphql } from '../gql.tada';

// Cart Query
export const CartQuery = graphql(`
  query Cart {
    me {
      cart {
        items {
          _id
          product {
            _id
            texts {
              title
            }
          }
          quantity
          originalProduct {
            _id
            texts {
              title
            }
            media {
              file {
                url
              }
            }
          }
          unitPrice {
            amount
            currencyCode
          }
        }
        total {
          amount
          currencyCode
        }
      }
    }
  }
`);

// Add to Cart Mutation
export const AddToCartMutation = graphql(`
  mutation AddToCart($productId: ID!, $quantity: Int) {
    addCartProduct(productId: $productId, quantity: $quantity) {
      _id
      product {
        _id
        texts {
          title
        }
      }
      quantity
      originalProduct {
        _id
        texts {
          title
        }
        media {
          file {
            url
          }
        }
      }
      unitPrice {
        amount
        currencyCode
      }
    }
  }
`);

// Update Cart Item Mutation
export const UpdateCartItemMutation = graphql(`
  mutation UpdateCartItem($itemId: ID!, $quantity: Int) {
    updateCartItem(itemId: $itemId, quantity: $quantity) {
      _id
      product {
        _id
        texts {
          title
        }
      }
      quantity
      originalProduct {
        _id
        texts {
          title
        }
        media {
          file {
            url
          }
        }
      }
      unitPrice {
        amount
        currencyCode
      }
    }
  }
`);

// Remove from Cart Mutation
export const RemoveFromCartMutation = graphql(`
  mutation RemoveFromCart($itemId: ID!) {
    removeCartItem(itemId: $itemId) {
      _id
      product {
        _id
        texts {
          title
        }
      }
      quantity
      originalProduct {
        _id
        texts {
          title
        }
        media {
          file {
            url
          }
        }
      }
      unitPrice {
        amount
        currencyCode
      }
    }
  }
`);

// Clear Cart Mutation
export const ClearCartMutation = graphql(`
  mutation ClearCart {
    emptyCart {
      _id
      items {
        _id
        product {
          _id
          texts {
            title
          }
        }
        quantity
        originalProduct {
          _id
          texts {
            title
          }
          media {
            file {
              url
            }
          }
        }
        unitPrice {
          amount
          currencyCode
        }
      }
      total {
        amount
        currencyCode
      }
    }
  }
`);

// Checkout Mutation
export const CheckoutMutation = graphql(`
  mutation Checkout(
    $orderId: ID
    $paymentContext: JSON
    $deliveryContext: JSON
  ) {
    checkoutCart(
      orderId: $orderId
      paymentContext: $paymentContext
      deliveryContext: $deliveryContext
    ) {
      _id
      orderNumber
      status
      total {
        amount
        currencyCode
      }
      items {
        _id
        product {
          _id
          texts {
            title
          }
        }
        quantity
        unitPrice {
          amount
          currencyCode
        }
      }
    }
  }
`);

// Guest Login Mutation
export const GuestLoginMutation = graphql(`
  mutation GuestLogin {
    loginAsGuest {
      _id
      tokenExpires
    }
  }
`);
