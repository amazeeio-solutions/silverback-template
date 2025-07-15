import { ImageSource } from '@custom/schema';
import { beforeEach, describe, expect, it } from 'vitest';

import { useCartStore } from './cart';

describe('Cart Store', () => {
  beforeEach(() => {
    // Reset the store before each test
    useCartStore.setState({ items: [] });
  });

  const mockProduct = {
    id: 'product-1',
    title: 'Test Product',
    price: 19.99,
    sku: 'TEST-001',
    stock: 10,
    teaserImage: {
      alt: 'Test Product Image',
      source: 'https://example.com/image.jpg' as ImageSource,
    },
  };

  const mockProduct2 = {
    id: 'product-2',
    title: 'Another Product',
    price: 29.99,
    sku: 'TEST-002',
    stock: 5,
  };

  describe('addItem', () => {
    it('should add a new item to the cart', () => {
      const store = useCartStore.getState();
      store.addItem(mockProduct);

      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0]).toEqual({
        id: 'product-1',
        title: 'Test Product',
        price: 19.99,
        quantity: 1,
        sku: 'TEST-001',
        teaserImage: mockProduct.teaserImage,
        maxStock: 10,
      });
    });

    it('should increment quantity if item already exists', () => {
      const store = useCartStore.getState();
      store.addItem(mockProduct);
      store.addItem(mockProduct);

      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(2);
    });

    it('should respect stock limit when adding items', () => {
      const limitedProduct = { ...mockProduct, stock: 2 };
      const store = useCartStore.getState();

      store.addItem(limitedProduct);
      store.addItem(limitedProduct);
      store.addItem(limitedProduct); // This should not increase quantity beyond stock

      const items = useCartStore.getState().items;
      expect(items[0].quantity).toBe(2);
    });

    it('should handle products without teaserImage', () => {
      const productWithoutImage = { ...mockProduct };
      delete (productWithoutImage as Record<string, unknown>).teaserImage;

      const store = useCartStore.getState();
      store.addItem(productWithoutImage);

      const items = useCartStore.getState().items;
      expect(items[0].teaserImage).toBeUndefined();
    });
  });

  describe('removeItem', () => {
    it('should remove an item from the cart', () => {
      const store = useCartStore.getState();
      store.addItem(mockProduct);
      store.addItem(mockProduct2);

      expect(useCartStore.getState().items).toHaveLength(2);

      store.removeItem('product-1');

      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].id).toBe('product-2');
    });

    it('should do nothing if item does not exist', () => {
      const store = useCartStore.getState();
      store.addItem(mockProduct);

      store.removeItem('non-existent-id');

      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
    });
  });

  describe('updateQuantity', () => {
    it('should update item quantity', () => {
      const store = useCartStore.getState();
      store.addItem(mockProduct);

      store.updateQuantity('product-1', 3);

      const items = useCartStore.getState().items;
      expect(items[0].quantity).toBe(3);
    });

    it('should respect stock limit when updating quantity', () => {
      const store = useCartStore.getState();
      store.addItem(mockProduct);

      store.updateQuantity('product-1', 15); // More than stock (10)

      const items = useCartStore.getState().items;
      expect(items[0].quantity).toBe(10);
    });

    it('should remove item if quantity is 0 or negative', () => {
      const store = useCartStore.getState();
      store.addItem(mockProduct);

      store.updateQuantity('product-1', 0);

      const items = useCartStore.getState().items;
      expect(items).toHaveLength(0);
    });

    it('should handle negative quantities', () => {
      const store = useCartStore.getState();
      store.addItem(mockProduct);

      store.updateQuantity('product-1', -5);

      const items = useCartStore.getState().items;
      expect(items).toHaveLength(0);
    });
  });

  describe('clearCart', () => {
    it('should remove all items from the cart', () => {
      const store = useCartStore.getState();
      store.addItem(mockProduct);
      store.addItem(mockProduct2);

      expect(useCartStore.getState().items).toHaveLength(2);

      store.clearCart();

      expect(useCartStore.getState().items).toHaveLength(0);
    });
  });

  describe('getTotalItems', () => {
    it('should return total number of items', () => {
      const store = useCartStore.getState();
      store.addItem(mockProduct);
      store.addItem(mockProduct2);
      store.updateQuantity('product-1', 3);

      const total = store.getTotalItems();
      expect(total).toBe(4); // 3 of product-1 + 1 of product-2
    });

    it('should return 0 for empty cart', () => {
      const store = useCartStore.getState();
      expect(store.getTotalItems()).toBe(0);
    });
  });

  describe('getTotalPrice', () => {
    it('should calculate total price correctly', () => {
      const store = useCartStore.getState();
      store.addItem(mockProduct); // 19.99 * 1 = 19.99
      store.addItem(mockProduct2); // 29.99 * 1 = 29.99
      store.updateQuantity('product-1', 2); // 19.99 * 2 = 39.98

      const total = store.getTotalPrice();
      expect(total).toBe(69.97); // 39.98 + 29.99
    });

    it('should return 0 for empty cart', () => {
      const store = useCartStore.getState();
      expect(store.getTotalPrice()).toBe(0);
    });
  });

  describe('getCartItem', () => {
    it('should return cart item by id', () => {
      const store = useCartStore.getState();
      store.addItem(mockProduct);

      const item = store.getCartItem('product-1');
      expect(item).toBeDefined();
      expect(item?.id).toBe('product-1');
    });

    it('should return undefined for non-existent item', () => {
      const store = useCartStore.getState();
      const item = store.getCartItem('non-existent-id');
      expect(item).toBeUndefined();
    });
  });

  describe('isInCart', () => {
    it('should return true if item is in cart', () => {
      const store = useCartStore.getState();
      store.addItem(mockProduct);

      expect(store.isInCart('product-1')).toBe(true);
    });

    it('should return false if item is not in cart', () => {
      const store = useCartStore.getState();
      expect(store.isInCart('non-existent-id')).toBe(false);
    });
  });
});
