"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  AddToCartMutation: () => AddToCartMutation,
  CartQuery: () => CartQuery,
  CheckoutMutation: () => CheckoutMutation,
  ClearCartMutation: () => ClearCartMutation,
  GuestLoginMutation: () => GuestLoginMutation,
  RemoveFromCartMutation: () => RemoveFromCartMutation,
  UnchainedGraphQLClient: () => UnchainedGraphQLClient,
  UpdateCartItemMutation: () => UpdateCartItemMutation,
  addToCartExecutor: () => addToCartExecutor,
  cartExecutor: () => cartExecutor,
  checkoutExecutor: () => checkoutExecutor,
  clearCartExecutor: () => clearCartExecutor,
  createAddToCartExecutor: () => createAddToCartExecutor,
  createCartExecutor: () => createCartExecutor,
  createCheckoutExecutor: () => createCheckoutExecutor,
  createClearCartExecutor: () => createClearCartExecutor,
  createGuestLoginExecutor: () => createGuestLoginExecutor,
  createRemoveFromCartExecutor: () => createRemoveFromCartExecutor,
  createSessionAwareAddToCartExecutor: () => createSessionAwareAddToCartExecutor,
  createSessionAwareCartExecutor: () => createSessionAwareCartExecutor,
  createSessionAwareCheckoutExecutor: () => createSessionAwareCheckoutExecutor,
  createSessionAwareClearCartExecutor: () => createSessionAwareClearCartExecutor,
  createSessionAwareRemoveFromCartExecutor: () => createSessionAwareRemoveFromCartExecutor,
  createSessionAwareUpdateCartItemExecutor: () => createSessionAwareUpdateCartItemExecutor,
  createUpdateCartItemExecutor: () => createUpdateCartItemExecutor,
  defaultClient: () => defaultClient,
  graphql: () => graphql,
  guestLoginExecutor: () => guestLoginExecutor,
  readFragment: () => import_gql2.readFragment,
  removeFromCartExecutor: () => removeFromCartExecutor,
  sessionAwareAddToCartExecutor: () => sessionAwareAddToCartExecutor,
  sessionAwareCartExecutor: () => sessionAwareCartExecutor,
  sessionAwareCheckoutExecutor: () => sessionAwareCheckoutExecutor,
  sessionAwareClearCartExecutor: () => sessionAwareClearCartExecutor,
  sessionAwareRemoveFromCartExecutor: () => sessionAwareRemoveFromCartExecutor,
  sessionAwareUpdateCartItemExecutor: () => sessionAwareUpdateCartItemExecutor,
  updateCartItemExecutor: () => updateCartItemExecutor
});
module.exports = __toCommonJS(index_exports);

// src/client.ts
var import_graphql = require("graphql");

// src/gql.tada.ts
var import_gql = require("gql.tada");
var import_gql2 = require("gql.tada");
var graphql = (0, import_gql.initGraphQLTada)();

// src/operations/index.ts
var CartQuery = graphql(`
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
var AddToCartMutation = graphql(`
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
var UpdateCartItemMutation = graphql(`
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
var RemoveFromCartMutation = graphql(`
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
var ClearCartMutation = graphql(`
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
var CheckoutMutation = graphql(`
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
var GuestLoginMutation = graphql(`
  mutation GuestLogin {
    loginAsGuest {
      _id
      tokenExpires
    }
  }
`);

// src/client.ts
var UnchainedGraphQLClient = class {
  endpoint;
  isGuestLoggedIn = false;
  loginPromise = null;
  constructor(endpoint = "https://kls.n\xF6d.live/graphql") {
    this.endpoint = endpoint;
  }
  /**
   * Ensures a guest session exists by performing guest login if necessary
   */
  async ensureGuestLogin() {
    if (this.isGuestLoggedIn) {
      return;
    }
    if (this.loginPromise) {
      return this.loginPromise;
    }
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
  async performGuestLogin() {
    const queryString = (0, import_graphql.print)(GuestLoginMutation);
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        query: queryString,
        variables: {}
      })
    });
    if (!response.ok) {
      throw new Error(`Guest login failed: HTTP ${response.status}`);
    }
    const result = await response.json();
    if (result.errors) {
      throw new Error(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        `Guest login failed: ${result.errors.map((e) => e.message).join(", ")}`
      );
    }
    if (!result.data?.loginAsGuest) {
      throw new Error("Guest login failed: No guest user returned");
    }
    this.isGuestLoggedIn = true;
  }
  /**
   * Helper method to detect if an error indicates authentication is required
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  isAuthenticationError(result) {
    if (!result.errors) {
      return false;
    }
    return result.errors.some((error) => {
      const message = error.message?.toLowerCase() || "";
      const extensions = error.extensions || {};
      return message.includes("unauthenticated") || message.includes("authentication required") || message.includes("not authorized") || message.includes("guest session required") || extensions.code === "UNAUTHENTICATED" || extensions.code === "AUTHENTICATION_REQUIRED";
    });
  }
  /**
   * Helper method to check if query is the guest login mutation
   */
  isGuestLoginQuery(query) {
    const queryString = typeof query === "string" ? query : (0, import_graphql.print)(query);
    return queryString.includes("loginAsGuest");
  }
  // Implementation that handles all overloads
  async request(query, variables) {
    return this.requestWithRetry(query, variables, false);
  }
  /**
   * Internal request method that handles authentication retry logic
   */
  async requestWithRetry(query, variables, isRetry = false) {
    const queryString = typeof query === "string" ? query : (0, import_graphql.print)(query);
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      // Include cookies for session management
      body: JSON.stringify({
        query: queryString,
        variables
      })
    });
    if (!response.ok) {
      if (response.status === 401 && !isRetry && !this.isGuestLoginQuery(query)) {
        await this.ensureGuestLogin();
        return this.requestWithRetry(query, variables, true);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    if (result.errors) {
      if (!isRetry && !this.isGuestLoginQuery(query) && this.isAuthenticationError(result)) {
        this.isGuestLoggedIn = false;
        await this.ensureGuestLogin();
        return this.requestWithRetry(query, variables, true);
      }
      throw new Error(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        `GraphQL error: ${result.errors.map((e) => e.message).join(", ")}`
      );
    }
    return result.data;
  }
};
var defaultClient = new UnchainedGraphQLClient();

// src/executors/cart.ts
function createCartExecutor(client = defaultClient) {
  return async (id, vars) => {
    const result = await client.request(CartQuery, vars);
    return { data: result, error: null };
  };
}
var cartExecutor = createCartExecutor();

// src/executors/add-to-cart.ts
function createAddToCartExecutor(client = defaultClient) {
  return async (id, vars) => {
    const result = await client.request(AddToCartMutation, vars);
    return { data: result, error: null };
  };
}
var addToCartExecutor = createAddToCartExecutor();

// src/executors/update-cart-item.ts
function createUpdateCartItemExecutor(client = defaultClient) {
  return async (id, vars) => {
    const result = await client.request(UpdateCartItemMutation, vars);
    return { data: result, error: null };
  };
}
var updateCartItemExecutor = createUpdateCartItemExecutor();

// src/executors/remove-from-cart.ts
function createRemoveFromCartExecutor(client = defaultClient) {
  return async (id, vars) => {
    const result = await client.request(RemoveFromCartMutation, vars);
    return { data: result, error: null };
  };
}
var removeFromCartExecutor = createRemoveFromCartExecutor();

// src/executors/clear-cart.ts
function createClearCartExecutor(client = defaultClient) {
  return async (id, vars) => {
    const result = await client.request(ClearCartMutation, vars);
    return { data: result, error: null };
  };
}
var clearCartExecutor = createClearCartExecutor();

// src/executors/checkout.ts
function createCheckoutExecutor(client = defaultClient) {
  return async (id, vars) => {
    const result = await client.request(CheckoutMutation, vars);
    return { data: result, error: null };
  };
}
var checkoutExecutor = createCheckoutExecutor();

// src/executors/guest-login.ts
function createGuestLoginExecutor(client = defaultClient) {
  return async (id, vars) => {
    const result = await client.request(GuestLoginMutation, vars);
    return { data: result, error: null };
  };
}
var guestLoginExecutor = createGuestLoginExecutor();

// src/executors/session-aware/cart.ts
function createSessionAwareCartExecutor(client = new UnchainedGraphQLClient()) {
  return async (id, vars) => {
    const result = await client.request(CartQuery, vars);
    return { data: result, error: null };
  };
}
var sessionAwareCartExecutor = createSessionAwareCartExecutor();

// src/executors/session-aware/add-to-cart.ts
function createSessionAwareAddToCartExecutor(client = new UnchainedGraphQLClient()) {
  return async (id, vars) => {
    const result = await client.request(AddToCartMutation, vars);
    return { data: result, error: null };
  };
}
var sessionAwareAddToCartExecutor = createSessionAwareAddToCartExecutor();

// src/executors/session-aware/update-cart-item.ts
function createSessionAwareUpdateCartItemExecutor(client = new UnchainedGraphQLClient()) {
  return async (id, vars) => {
    const result = await client.request(UpdateCartItemMutation, vars);
    return { data: result, error: null };
  };
}
var sessionAwareUpdateCartItemExecutor = createSessionAwareUpdateCartItemExecutor();

// src/executors/session-aware/remove-from-cart.ts
function createSessionAwareRemoveFromCartExecutor(client = new UnchainedGraphQLClient()) {
  return async (id, vars) => {
    const result = await client.request(RemoveFromCartMutation, vars);
    return { data: result, error: null };
  };
}
var sessionAwareRemoveFromCartExecutor = createSessionAwareRemoveFromCartExecutor();

// src/executors/session-aware/clear-cart.ts
function createSessionAwareClearCartExecutor(client = new UnchainedGraphQLClient()) {
  return async (id, vars) => {
    const result = await client.request(ClearCartMutation, vars);
    return { data: result, error: null };
  };
}
var sessionAwareClearCartExecutor = createSessionAwareClearCartExecutor();

// src/executors/session-aware/checkout.ts
function createSessionAwareCheckoutExecutor(client = new UnchainedGraphQLClient()) {
  return async (id, vars) => {
    const result = await client.request(CheckoutMutation, vars);
    return { data: result, error: null };
  };
}
var sessionAwareCheckoutExecutor = createSessionAwareCheckoutExecutor();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AddToCartMutation,
  CartQuery,
  CheckoutMutation,
  ClearCartMutation,
  GuestLoginMutation,
  RemoveFromCartMutation,
  UnchainedGraphQLClient,
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
  readFragment,
  removeFromCartExecutor,
  sessionAwareAddToCartExecutor,
  sessionAwareCartExecutor,
  sessionAwareCheckoutExecutor,
  sessionAwareClearCartExecutor,
  sessionAwareRemoveFromCartExecutor,
  sessionAwareUpdateCartItemExecutor,
  updateCartItemExecutor
});
//# sourceMappingURL=index.cjs.map