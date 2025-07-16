import { ImageSource } from '@custom/schema';
import { create } from 'zustand';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  sku: string;
  teaserImage?: {
    alt: string;
    source: ImageSource;
  };
  maxStock: number;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

interface CartStore {
  items: CartItem[];

  // Actions
  addItem: (product: {
    id: string;
    title: string;
    price: number;
    sku: string;
    stock: number;
    teaserImage?: {
      alt: string;
      source: ImageSource;
    };
  }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;

  // Computed values
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getCartItem: (id: string) => CartItem | undefined;
  isInCart: (id: string) => boolean;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (product) => {
    const existingItem = get().items.find((item) => item.id === product.id);

    if (existingItem) {
      // Update quantity if item already exists, but respect stock limit
      const newQuantity = Math.min(existingItem.quantity + 1, product.stock);
      set((state) => ({
        items: state.items.map((item) =>
          item.id === product.id ? { ...item, quantity: newQuantity } : item,
        ),
      }));
    } else {
      // Add new item
      const newItem: CartItem = {
        id: product.id,
        title: product.title,
        price: product.price,
        quantity: 1,
        sku: product.sku,
        teaserImage: product.teaserImage,
        maxStock: product.stock,
      };
      set((state) => ({
        items: [...state.items, newItem],
      }));
    }
  },

  removeItem: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },

  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      get().removeItem(id);
      return;
    }

    set((state) => ({
      items: state.items.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.min(quantity, item.maxStock) }
          : item,
      ),
    }));
  },

  clearCart: () => {
    set({ items: [] });
  },

  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },

  getTotalPrice: () => {
    return get().items.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  },

  getCartItem: (id) => {
    return get().items.find((item) => item.id === id);
  },

  isInCart: (id) => {
    return get().items.some((item) => item.id === id);
  },
}));
