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

// Update Cart Mutation (for setting billing address and payment/delivery providers)
export const UpdateCartMutation = graphql(`
  mutation UpdateCart(
    $orderId: ID
    $billingAddress: AddressInput
    $contact: ContactInput
    $paymentProviderId: ID
    $deliveryProviderId: ID
    $meta: JSON
  ) {
    updateCart(
      orderId: $orderId
      billingAddress: $billingAddress
      contact: $contact
      paymentProviderId: $paymentProviderId
      deliveryProviderId: $deliveryProviderId
      meta: $meta
    ) {
      _id
      orderNumber
      billingAddress {
        firstName
        lastName
        company
        addressLine
        addressLine2
        postalCode
        regionCode
        city
        countryCode
      }
      contact {
        emailAddress
        telNumber
      }
      payment {
        _id
        provider {
          _id
          type
          interface {
            _id
          }
        }
      }
      total {
        amount
        currencyCode
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

// Sign Payment Provider For Checkout Mutation (for generic payment providers)
export const SignPaymentProviderForCheckoutMutation = graphql(`
  mutation SignPaymentProviderForCheckout(
    $transactionContext: JSON
  ) {
    signPaymentProviderForCheckout(
      transactionContext: $transactionContext
    )
  }
`);
