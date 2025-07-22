import { graphql } from '../gql.tada';

// Cart Query
export const CartQuery = graphql(`
  query Cart {
    cart {
      items {
        id
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
`);

// Add to Cart Mutation
export const AddToCartMutation = graphql(`
  mutation AddToCart($input: AddToCartInput!) {
    addToCart(input: $input) {
      cart {
        items {
          id
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
      }
    }
  }
`);

// Update Cart Item Mutation
export const UpdateCartItemMutation = graphql(`
  mutation UpdateCartItem($input: UpdateCartItemInput!) {
    updateCartItem(input: $input) {
      cart {
        items {
          id
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
      }
    }
  }
`);

// Remove from Cart Mutation
export const RemoveFromCartMutation = graphql(`
  mutation RemoveFromCart($productId: String!) {
    removeFromCart(productId: $productId) {
      cart {
        items {
          id
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
      }
    }
  }
`);

// Clear Cart Mutation
export const ClearCartMutation = graphql(`
  mutation ClearCart {
    clearCart {
      cart {
        items {
          id
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
      }
    }
  }
`);

// Checkout Mutation
export const CheckoutMutation = graphql(`
  mutation Checkout($input: CheckoutInput!) {
    checkout(input: $input) {
      order {
        id
        orderNumber
        status
        totalAmount
        items {
          id
          title
          price
          quantity
          sku
        }
      }
      errors {
        message
      }
      paymentRedirectUrl
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
