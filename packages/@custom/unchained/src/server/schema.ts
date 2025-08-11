import { gql } from 'graphql-tag';

export const typeDefs = gql`
  # Guest Authentication Types
  type GuestUser {
    _id: String!
    tokenExpires: String!
  }

  # Cart Types
  type CartItem {
    id: String!
    title: String!
    price: Float!
    quantity: Int!
    sku: String!
    teaserImage: Image
    maxStock: Int!
  }

  type Image {
    alt: String
    source: String
  }

  type Cart {
    items: [CartItem!]!
    totalItems: Int!
    totalPrice: Float!
  }

  # Error Types
  type MutationError {
    message: String!
    key: String
    field: String
  }

  # Response Types
  type CartMutationResponse {
    cart: Cart
    errors: [MutationError!]!
  }

  type CheckoutResponse {
    order: Order
    errors: [MutationError!]!
    paymentRedirectUrl: String
  }

  # Order Types
  type Order {
    id: String!
    orderNumber: String!
    status: String!
    totalAmount: Float!
    items: [OrderItem!]!
  }

  type OrderItem {
    id: String!
    title: String!
    price: Float!
    quantity: Int!
    sku: String!
  }

  # Input Types
  input AddToCartInput {
    productId: String!
    quantity: Int = 1
  }

  input UpdateCartItemInput {
    itemId: String!
    quantity: Int!
  }

  input CheckoutInput {
    email: String!
    firstName: String!
    lastName: String!
    address: String
    city: String
    postalCode: String
    country: String
    donation: Float
    successRedirectUrl: String
    cancelRedirectUrl: String
    failedRedirectUrl: String
  }

  # Queries
  type Query {
    cart: Cart!
  }

  # Mutations
  type Mutation {
    loginAsGuest: GuestUser!
    addToCart(input: AddToCartInput!): CartMutationResponse!
    updateCartItem(input: UpdateCartItemInput!): CartMutationResponse!
    removeFromCart(productId: String!): CartMutationResponse!
    clearCart: CartMutationResponse!
    checkout(input: CheckoutInput!): CheckoutResponse!
  }
`;
