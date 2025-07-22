import fetch from 'node-fetch';

// Types
export interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  sku: string;
  teaserImage?: {
    alt: string;
    source: string;
  };
  maxStock: number;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

export interface Product {
  id: string;
  title: string;
  price: number;
  sku: string;
  stock: number;
  teaserImage?: {
    alt: string;
    source: string;
  };
}

export interface GuestUser {
  _id: string;
  tokenExpires: string;
}

// In-memory storage
const sessions = new Map<string, GuestUser>();
const carts = new Map<string, Cart>();
const productCache = new Map<string, Product>();
let cacheExpiry = 0;

export class CartService {
  private drupalEndpoint: string;

  constructor(drupalEndpoint = 'http://localhost:8888/graphql') {
    this.drupalEndpoint = drupalEndpoint;
  }

  // Session management
  createGuestSession(): GuestUser {
    const guestUser: GuestUser = {
      _id: `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    };
    
    sessions.set(guestUser._id, guestUser);
    
    // Initialize empty cart for the session
    carts.set(guestUser._id, {
      items: [],
      totalItems: 0,
      totalPrice: 0,
    });

    return guestUser;
  }

  validateSession(sessionId: string): boolean {
    const session = sessions.get(sessionId);
    if (!session) return false;

    const expiry = new Date(session.tokenExpires);
    return expiry > new Date();
  }

  // Product data fetching from Drupal
  async fetchProducts(): Promise<Product[]> {
    // Cache products for 5 minutes
    if (Date.now() < cacheExpiry && productCache.size > 0) {
      return Array.from(productCache.values());
    }

    try {
      const query = `
        query GetProducts {
          allProducts {
            id
            title
            price
            sku
            stock
            teaserImage {
              alt
              source(width: 200, height: 200)
            }
          }
        }
      `;

      const response = await fetch(this.drupalEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      const result = await response.json() as { 
        data?: { allProducts?: Product[] }; 
        errors?: Array<{ message: string }>;
      };
      
      if (result.errors) {
        console.error('Drupal GraphQL errors:', result.errors);
        return [];
      }

      const products = result.data?.allProducts || [];
      
      // Update cache
      productCache.clear();
      products.forEach((product: Product) => {
        productCache.set(product.id, product);
      });
      cacheExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes

      return products;
    } catch (error) {
      console.error('Failed to fetch products from Drupal:', error);
      return [];
    }
  }

  async getProduct(productId: string): Promise<Product | null> {
    // Try cache first
    if (productCache.has(productId) && Date.now() < cacheExpiry) {
      return productCache.get(productId) || null;
    }

    // Fetch all products to update cache
    await this.fetchProducts();
    return productCache.get(productId) || null;
  }

  // Cart operations
  getCart(sessionId: string): Cart {
    if (!this.validateSession(sessionId)) {
      throw new Error('Invalid or expired session');
    }

    return carts.get(sessionId) || {
      items: [],
      totalItems: 0,
      totalPrice: 0,
    };
  }

  async addToCart(sessionId: string, productId: string, quantity: number = 1): Promise<Cart> {
    if (!this.validateSession(sessionId)) {
      throw new Error('Invalid or expired session');
    }

    const product = await this.getProduct(productId);
    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
    }

    const cart = this.getCart(sessionId);
    const existingItemIndex = cart.items.findIndex(item => item.id === productId);

    if (existingItemIndex >= 0) {
      // Update existing item
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      if (newQuantity > product.stock) {
        throw new Error(`Insufficient stock. Available: ${product.stock}, Requested: ${newQuantity}`);
      }
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      if (quantity > product.stock) {
        throw new Error(`Insufficient stock. Available: ${product.stock}, Requested: ${quantity}`);
      }
      
      cart.items.push({
        id: product.id,
        title: product.title,
        price: product.price,
        quantity,
        sku: product.sku,
        teaserImage: product.teaserImage,
        maxStock: product.stock,
      });
    }

    this.recalculateCart(cart);
    carts.set(sessionId, cart);
    return cart;
  }

  async updateCartItem(sessionId: string, itemId: string, quantity: number): Promise<Cart> {
    if (!this.validateSession(sessionId)) {
      throw new Error('Invalid or expired session');
    }

    const cart = this.getCart(sessionId);
    const itemIndex = cart.items.findIndex(item => item.id === itemId);

    if (itemIndex === -1) {
      throw new Error(`Item with ID ${itemId} not found in cart`);
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      cart.items.splice(itemIndex, 1);
    } else {
      const product = await this.getProduct(itemId);
      if (product && quantity > product.stock) {
        throw new Error(`Insufficient stock. Available: ${product.stock}, Requested: ${quantity}`);
      }
      cart.items[itemIndex].quantity = quantity;
    }

    this.recalculateCart(cart);
    carts.set(sessionId, cart);
    return cart;
  }

  removeFromCart(sessionId: string, productId: string): Cart {
    if (!this.validateSession(sessionId)) {
      throw new Error('Invalid or expired session');
    }

    const cart = this.getCart(sessionId);
    cart.items = cart.items.filter(item => item.id !== productId);

    this.recalculateCart(cart);
    carts.set(sessionId, cart);
    return cart;
  }

  clearCart(sessionId: string): Cart {
    if (!this.validateSession(sessionId)) {
      throw new Error('Invalid or expired session');
    }

    const cart: Cart = {
      items: [],
      totalItems: 0,
      totalPrice: 0,
    };

    carts.set(sessionId, cart);
    return cart;
  }

  private recalculateCart(cart: Cart): void {
    cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    // Round to 2 decimal places
    cart.totalPrice = Math.round(cart.totalPrice * 100) / 100;
  }

  // Checkout
  async processCheckout(sessionId: string) {
    if (!this.validateSession(sessionId)) {
      throw new Error('Invalid or expired session');
    }

    const cart = this.getCart(sessionId);
    
    if (cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    // Create order
    const order = {
      id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      orderNumber: `ORD-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
      status: 'pending',
      totalAmount: cart.totalPrice,
      items: cart.items.map(item => ({
        id: item.id,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        sku: item.sku,
      })),
    };

    // Clear cart after successful checkout
    this.clearCart(sessionId);

    // For demo purposes, return a mock payment URL
    const paymentRedirectUrl = cart.totalPrice > 0 
      ? `https://payment.example.com/pay/${order.id}` 
      : null;

    return {
      order,
      paymentRedirectUrl,
    };
  }

  // Cleanup expired sessions (should be called periodically)
  cleanupExpiredSessions(): void {
    const now = new Date();
    sessions.forEach((session, sessionId) => {
      if (new Date(session.tokenExpires) <= now) {
        sessions.delete(sessionId);
        carts.delete(sessionId);
      }
    });
  }
}