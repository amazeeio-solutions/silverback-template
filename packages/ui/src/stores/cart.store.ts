'use client';
import {
  AddToCartMutation,
  CartQuery,
  ClearCartMutation,
  RemoveFromCartMutation,
  UpdateCartItemMutation,
  useOperationExecutor,
} from '@custom/schema';
import { useEffect, useMemo } from 'react';
import { create } from 'zustand';

import { clear } from '../utils/operation';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GraphQLExecutor = (operation: any, variables?: any) => Promise<any>;

type CartMutationResult = {
  cart?: CartData;
  errors?: Array<{ message: string }>;
};

type AddToCartResult = { addToCart?: CartMutationResult };
type UpdateCartItemResult = { updateCartItem?: CartMutationResult };
type RemoveFromCartResult = { removeFromCart?: CartMutationResult };
type ClearCartResult = { clearCart?: CartMutationResult };

type CartItem = NonNullable<CartQuery['cart']['items'][0]>;
type CartData = CartQuery['cart'];

interface CartState {
  cart: CartData;
  isLoading: boolean;
  error?: string;
  optimisticItems: CartItem[];
  isOptimistic: boolean;
}

interface CartActions {
  setCart: (cart: CartData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error?: string) => void;
  clearError: () => void;

  addToCart: (
    productId: string,
    quantity?: number,
    executor?: GraphQLExecutor,
  ) => Promise<void>;

  updateCartItem: (
    productId: string,
    quantity: number,
    executor?: GraphQLExecutor,
  ) => Promise<void>;

  removeFromCart: (
    productId: string,
    executor?: GraphQLExecutor,
  ) => Promise<void>;

  clearCart: (executor?: GraphQLExecutor) => Promise<void>;

  refreshCart: () => void;
  reset: () => void;
}

type CartStore = CartState & CartActions;

const initialState: CartState = {
  cart: {
    items: [],
    totalItems: 0,
    totalPrice: 0,
  },
  isLoading: false,
  optimisticItems: [],
  isOptimistic: false,
};

const calculateCartTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  return { totalItems, totalPrice };
};

const useCartStore = create<CartStore>((set, get) => ({
  ...initialState,

  setCart: (cart) => {
    set({
      cart,
      isOptimistic: false,
      optimisticItems: [],
    });
  },

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  clearError: () => set({ error: undefined }),

  addToCart: async (productId, quantity = 1, executor) => {
    const { cart } = get();

    set({ error: undefined });

    const existingItem = cart.items.find((item) => item.id === productId);
    console.log('existingItem', existingItem);
    let optimisticItems: CartItem[];

    if (existingItem) {
      const newQuantity = Math.min(
        existingItem.quantity + quantity,
        existingItem.maxStock,
      );
      optimisticItems = cart.items.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item,
      );
    } else {
      const newItem: CartItem = {
        id: productId,
        title: 'Loading...',
        price: 0,
        quantity,
        sku: '',
        teaserImage: undefined,
        maxStock: 999,
      };
      optimisticItems = [...cart.items, newItem];
    }

    const { totalItems, totalPrice } = calculateCartTotals(optimisticItems);
    const optimisticCart: CartData = {
      items: optimisticItems,
      totalItems,
      totalPrice,
    };

    set({
      cart: optimisticCart,
      isOptimistic: true,
      optimisticItems,
    });

    try {
      if (executor) {
        const result = await executor(AddToCartMutation, {
          input: { productId, quantity },
        });

        const typedResult = result as AddToCartResult;
        if (
          typedResult?.addToCart?.errors?.length &&
          typedResult.addToCart.errors.length > 0
        ) {
          throw new Error(typedResult.addToCart.errors[0].message);
        }

        if (typedResult?.addToCart?.cart) {
          set({
            cart: typedResult.addToCart.cart,
            isOptimistic: false,
            optimisticItems: [],
          });
        }
      }

      clear(CartQuery);
    } catch (error) {
      set({
        cart: get().cart,
        error:
          error instanceof Error ? error.message : 'Failed to add item to cart',
        isOptimistic: false,
        optimisticItems: [],
      });
    }
  },

  updateCartItem: async (productId, quantity, executor) => {
    const { cart } = get();

    if (!cart) return;

    set({ error: undefined });

    const optimisticItems = cart.items
      .map((item) =>
        item.id === productId
          ? {
              ...item,
              quantity: Math.max(0, Math.min(quantity, item.maxStock)),
            }
          : item,
      )
      .filter((item) => item.quantity > 0);

    const { totalItems, totalPrice } = calculateCartTotals(optimisticItems);
    const optimisticCart: CartData = {
      items: optimisticItems,
      totalItems,
      totalPrice,
    };

    set({
      cart: optimisticCart,
      isOptimistic: true,
      optimisticItems,
    });

    try {
      if (executor) {
        const result = await executor(UpdateCartItemMutation, {
          input: { productId, quantity },
        });

        const typedResult = result as UpdateCartItemResult;
        if (
          typedResult?.updateCartItem?.errors?.length &&
          typedResult.updateCartItem.errors.length > 0
        ) {
          throw new Error(typedResult.updateCartItem.errors[0].message);
        }

        if (typedResult?.updateCartItem?.cart) {
          set({
            cart: typedResult.updateCartItem.cart,
            isOptimistic: false,
            optimisticItems: [],
          });
        }
      }

      clear(CartQuery);
    } catch (error) {
      set({
        cart: get().cart,
        error:
          error instanceof Error ? error.message : 'Failed to update cart item',
        isOptimistic: false,
        optimisticItems: [],
      });
    }
  },

  removeFromCart: async (productId, executor) => {
    const { cart } = get();

    if (!cart) return;

    set({ error: undefined });

    const optimisticItems = cart.items.filter((item) => item.id !== productId);
    const { totalItems, totalPrice } = calculateCartTotals(optimisticItems);
    const optimisticCart: CartData = {
      items: optimisticItems,
      totalItems,
      totalPrice,
    };

    set({
      cart: optimisticCart,
      isOptimistic: true,
      optimisticItems,
    });

    try {
      if (executor) {
        const result = await executor(RemoveFromCartMutation, { productId });

        const typedResult = result as RemoveFromCartResult;
        if (
          typedResult?.removeFromCart?.errors?.length &&
          typedResult.removeFromCart.errors.length > 0
        ) {
          throw new Error(typedResult.removeFromCart.errors[0].message);
        }

        if (typedResult?.removeFromCart?.cart) {
          set({
            cart: typedResult.removeFromCart.cart,
            isOptimistic: false,
            optimisticItems: [],
          });
        }
      }

      clear(CartQuery);
    } catch (error) {
      set({
        cart: get().cart,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to remove item from cart',
        isOptimistic: false,
        optimisticItems: [],
      });
    }
  },

  clearCart: async (executor) => {
    const { cart } = get();

    if (!cart) return;

    set({ error: undefined });

    const optimisticCart: CartData = {
      items: [],
      totalItems: 0,
      totalPrice: 0,
    };

    set({
      cart: optimisticCart,
      isOptimistic: true,
      optimisticItems: [],
    });

    try {
      if (executor) {
        const result = await executor(ClearCartMutation, {});

        const typedResult = result as ClearCartResult;
        if (
          typedResult?.clearCart?.errors?.length &&
          typedResult.clearCart.errors.length > 0
        ) {
          throw new Error(typedResult.clearCart.errors[0].message);
        }

        if (typedResult?.clearCart?.cart) {
          set({
            cart: typedResult.clearCart.cart,
            isOptimistic: false,
            optimisticItems: [],
          });
        }
      }

      clear(CartQuery);
    } catch (error) {
      set({
        cart: get().cart,
        error: error instanceof Error ? error.message : 'Failed to clear cart',
        isOptimistic: false,
        optimisticItems: [],
      });
    }
  },

  refreshCart: () => {
    clear(CartQuery);
  },

  reset: () => {
    set(initialState);
  },
}));

/**
 * Unified cart hook that handles all cart operations with automatic executor injection.
 * This is the main cart interface that components should use.
 */
export function useCart() {
  // Get all cart-related executors
  const cartQueryExecutor = useOperationExecutor(CartQuery);
  const addToCartExecutor = useOperationExecutor(AddToCartMutation);
  const updateCartItemExecutor = useOperationExecutor(UpdateCartItemMutation);
  const removeFromCartExecutor = useOperationExecutor(RemoveFromCartMutation);
  const clearCartExecutor = useOperationExecutor(ClearCartMutation);

  const store = useCartStore();

  // Auto-load cart data on mount when executor is available
  useEffect(() => {
    const loadCart = async () => {
      if (cartQueryExecutor instanceof Function) {
        try {
          store.setLoading(true);
          const data = await cartQueryExecutor(CartQuery, undefined);
          console.log('cart data', data);
          if (data?.cart) {
            store.setCart(data.cart);
          }
        } catch (error) {
          store.setError(
            error instanceof Error ? error.message : 'Failed to load cart',
          );
        } finally {
          store.setLoading(false);
        }
      } else if (cartQueryExecutor) {
        // Static data case
        store.setCart(cartQueryExecutor.cart);
      }
    };

    loadCart();
  }, [cartQueryExecutor, store.setLoading, store.setCart, store.setError]);

  // Return store state and enhanced methods with executors pre-injected
  return useMemo(
    () => ({
      // Store state
      cart: store.cart,
      isLoading: store.isLoading,
      error: store.error,
      isOptimistic: store.isOptimistic,

      // Store actions that don't need executors
      setError: store.setError,
      clearError: store.clearError,
      reset: store.reset,

      // Enhanced methods with executors pre-injected
      addToCart: async (productId: string, quantity = 1) => {
        if (addToCartExecutor instanceof Function) {
          return store.addToCart(productId, quantity, addToCartExecutor);
        }
        throw new Error('Add to cart executor not available');
      },

      updateCartItem: async (productId: string, quantity: number) => {
        if (updateCartItemExecutor instanceof Function) {
          return store.updateCartItem(
            productId,
            quantity,
            updateCartItemExecutor,
          );
        }
        throw new Error('Update cart item executor not available');
      },

      removeFromCart: async (productId: string) => {
        if (removeFromCartExecutor instanceof Function) {
          return store.removeFromCart(productId, removeFromCartExecutor);
        }
        throw new Error('Remove from cart executor not available');
      },

      clearCart: async () => {
        if (clearCartExecutor instanceof Function) {
          return store.clearCart(clearCartExecutor);
        }
        throw new Error('Clear cart executor not available');
      },

      refreshCart: async () => {
        if (cartQueryExecutor instanceof Function) {
          try {
            store.setLoading(true);
            const data = await cartQueryExecutor(CartQuery, undefined);
            if (data?.cart) {
              store.setCart(data.cart);
            }
          } catch (error) {
            store.setError(
              error instanceof Error ? error.message : 'Failed to refresh cart',
            );
          } finally {
            store.setLoading(false);
          }
        }
      },
    }),
    [
      // Store state dependencies
      store.cart,
      store.isLoading,
      store.error,
      store.isOptimistic,
      // Store actions (stable references from Zustand)
      store.setError,
      store.clearError,
      store.reset,
      store.addToCart,
      store.updateCartItem,
      store.removeFromCart,
      store.clearCart,
      store.setLoading,
      store.setCart,
      // Executor dependencies
      cartQueryExecutor,
      addToCartExecutor,
      updateCartItemExecutor,
      removeFromCartExecutor,
      clearCartExecutor,
    ],
  );
}

export type Cart = ReturnType<typeof useCart>;
export type { CartItem, CartData };
