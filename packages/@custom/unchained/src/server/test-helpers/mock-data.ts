/**
 * Mock data fixtures for integration tests
 */

export const MOCK_PRODUCTS = {
  PRODUCT_1: {
    uuid: 'test-product-1',
    title: 'Integration Test Product 1',
    price: 29.99,
    sku: 'TEST-001',
    maxStock: 10,
    teaserImage: {
      alt: 'Test Product 1 Image',
      source: 'https://example.com/test-product-1.jpg',
    },
  },
  PRODUCT_2: {
    uuid: 'test-product-2',
    title: 'Integration Test Product 2',
    price: 49.99,
    sku: 'TEST-002',
    maxStock: 5,
    teaserImage: {
      alt: 'Test Product 2 Image',
      source: 'https://example.com/test-product-2.jpg',
    },
  },
} as const;

export const MOCK_USER_DATA = {
  VALID_CHECKOUT: {
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    address: '123 Test Street',
    city: 'Test City',
    postalCode: '12345',
    country: 'Test Country',
  },
  INVALID_CHECKOUT: {
    email: 'invalid-email',
    firstName: '',
    lastName: 'Doe',
  },
} as const;

export const MOCK_CART_ITEMS = {
  SINGLE_ITEM: [
    {
      uuid: 'test-product-1',
      title: MOCK_PRODUCTS.PRODUCT_1.title,
      price: MOCK_PRODUCTS.PRODUCT_1.price,
      quantity: 1,
      sku: MOCK_PRODUCTS.PRODUCT_1.sku,
      teaserImage: MOCK_PRODUCTS.PRODUCT_1.teaserImage,
      maxStock: MOCK_PRODUCTS.PRODUCT_1.maxStock,
    },
  ],
  MULTIPLE_ITEMS: [
    {
      uuid: 'test-product-1',
      title: MOCK_PRODUCTS.PRODUCT_1.title,
      price: MOCK_PRODUCTS.PRODUCT_1.price,
      quantity: 2,
      sku: MOCK_PRODUCTS.PRODUCT_1.sku,
      teaserImage: MOCK_PRODUCTS.PRODUCT_1.teaserImage,
      maxStock: MOCK_PRODUCTS.PRODUCT_1.maxStock,
    },
    {
      uuid: 'test-product-2',
      title: MOCK_PRODUCTS.PRODUCT_2.title,
      price: MOCK_PRODUCTS.PRODUCT_2.price,
      quantity: 1,
      sku: MOCK_PRODUCTS.PRODUCT_2.sku,
      teaserImage: MOCK_PRODUCTS.PRODUCT_2.teaserImage,
      maxStock: MOCK_PRODUCTS.PRODUCT_2.maxStock,
    },
  ],
};

export const MOCK_ORDERS = {
  SUCCESSFUL_ORDER: {
    id: 'order-123',
    orderNumber: 'ORD-2024-001',
    status: 'pending',
    totalAmount: 109.97,
    items: [
      {
        uuid: 'test-product-1',
        title: MOCK_PRODUCTS.PRODUCT_1.title,
        price: MOCK_PRODUCTS.PRODUCT_1.price,
        quantity: 2,
        sku: MOCK_PRODUCTS.PRODUCT_1.sku,
      },
      {
        uuid: 'test-product-2',
        title: MOCK_PRODUCTS.PRODUCT_2.title,
        price: MOCK_PRODUCTS.PRODUCT_2.price,
        quantity: 1,
        sku: MOCK_PRODUCTS.PRODUCT_2.sku,
      },
    ],
  },
} as const;

export const MOCK_ERRORS = {
  AUTHENTICATION_REQUIRED: {
    message: 'Authentication required',
    key: 'auth',
    field: null,
  },
  INVALID_PRODUCT: {
    message: 'Product not found',
    key: 'product',
    field: 'productId',
  },
  INSUFFICIENT_STOCK: {
    message: 'Insufficient stock',
    key: 'stock',
    field: 'quantity',
  },
  CHECKOUT_VALIDATION: {
    message: 'Invalid checkout data',
    key: 'validation',
    field: 'email',
  },
} as const;

/**
 * Helper function to create expected cart response data
 */
export function createExpectedCart(items: typeof MOCK_CART_ITEMS.SINGLE_ITEM) {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return {
    items,
    totalItems,
    totalPrice,
  };
}

/**
 * Helper function to create expected empty cart
 */
export function createEmptyCart() {
  return {
    items: [],
    totalItems: 0,
    totalPrice: 0,
  };
}
