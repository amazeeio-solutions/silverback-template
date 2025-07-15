import Landscape from '@stories/landscape.jpg?as=metadata';
import Portrait from '@stories/portrait.jpg?as=metadata';
import type { Meta, StoryObj } from '@storybook/react';

import { image } from '../../helpers/image';
import { useCartStore } from '../../stores/cart';
import { CartPage } from './CartPage';

const meta: Meta<typeof CartPage> = {
  title: 'Organisms/CartPage',
  component: CartPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    onContinueShopping: { action: 'continue shopping' },
    onCheckout: { action: 'checkout' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    showBreadcrumbs: false,
  },
  play: async () => {
    const store = useCartStore.getState();
    store.clearCart();
    store.addItem({
      id: '1',
      title: 'Premium Wireless Headphones',
      price: 199.99,
      sku: 'WH-001',
      stock: 10,
      teaserImage: {
        alt: 'Premium Wireless Headphones',
        source: image(Portrait, { width: 200, height: 200 }),
      },
    });
    store.addItem({
      id: '2',
      title: 'Smart Watch',
      price: 299.99,
      sku: 'SW-002',
      stock: 5,
      teaserImage: {
        alt: 'Smart Watch',
        source: image(Landscape, { width: 200, height: 200 }),
      },
    });
    store.updateQuantity('1', 2);
  },
};

export const EmptyCart: Story = {
  args: {
    showBreadcrumbs: false,
  },
  play: async () => {
    const store = useCartStore.getState();
    store.clearCart();
  },
};

export const SingleItem: Story = {
  args: {
    showBreadcrumbs: false,
  },
  play: async () => {
    const store = useCartStore.getState();
    store.clearCart();
    store.addItem({
      id: '1',
      title: 'Premium Wireless Headphones',
      price: 199.99,
      sku: 'WH-001',
      stock: 10,
      teaserImage: {
        alt: 'Premium Wireless Headphones',
        source: image(Portrait, { width: 200, height: 200 }),
      },
    });
  },
};

export const ManyItems: Story = {
  args: {
    showBreadcrumbs: false,
  },
  play: async () => {
    const store = useCartStore.getState();
    store.clearCart();

    const items = [
      {
        id: '1',
        title: 'Premium Wireless Headphones',
        price: 299.99,
        sku: 'SW-001',
      },
      { id: '2', title: 'Smart Watch', price: 299.99, sku: 'SW-002' },
      { id: '3', title: 'Bluetooth Speaker', price: 79.99, sku: 'BS-003' },
      { id: '4', title: 'Wireless Charger', price: 39.99, sku: 'WC-004' },
      { id: '5', title: 'Phone Case', price: 19.99, sku: 'PC-005' },
    ];

    items.forEach((item, index) => {
      store.addItem({
        ...item,
        stock: 10,
        teaserImage: {
          alt: item.title,
          source: image(Portrait, { width: 200, height: 200 }),
        },
      });
      if (index < 2) {
        store.updateQuantity(item.id, 2);
      }
    });
  },
};

export const WithoutBreadcrumbs: Story = {
  args: {
    showBreadcrumbs: false,
  },
  play: async () => {
    const store = useCartStore.getState();
    store.clearCart();
    store.addItem({
      id: '1',
      title: 'Premium Wireless Headphones',
      price: 199.99,
      sku: 'WH-001',
      stock: 10,
      teaserImage: {
        alt: 'Premium Wireless Headphones',
        source: image(Portrait, { width: 200, height: 200 }),
      },
    });
  },
};

export const WithoutCheckout: Story = {
  args: {
    onCheckout: undefined,
    showBreadcrumbs: false,
  },
  play: async () => {
    const store = useCartStore.getState();
    store.clearCart();
    store.addItem({
      id: '1',
      title: 'Premium Wireless Headphones',
      price: 199.99,
      sku: 'WH-001',
      stock: 10,
      teaserImage: {
        alt: 'Premium Wireless Headphones',
        source: image(Portrait, { width: 200, height: 200 }),
      },
    });
  },
};

export const ExpensiveItems: Story = {
  args: {
    showBreadcrumbs: false,
  },
  play: async () => {
    const store = useCartStore.getState();
    store.clearCart();
    store.addItem({
      id: '1',
      title: 'Professional Camera Equipment',
      price: 2999.99,
      sku: 'CAM-001',
      stock: 3,
      teaserImage: {
        alt: 'Professional Camera Equipment',
        source: image(Portrait, { width: 200, height: 200 }),
      },
    });
    store.addItem({
      id: '2',
      title: 'High-End Laptop',
      price: 3499.99,
      sku: 'LAP-002',
      stock: 2,
      teaserImage: {
        alt: 'High-End Laptop',
        source: image(Landscape, { width: 200, height: 200 }),
      },
    });
    store.updateQuantity('1', 2);
  },
};

export const ItemsWithoutImages: Story = {
  args: {
    showBreadcrumbs: false,
  },
  play: async () => {
    const store = useCartStore.getState();
    store.clearCart();
    store.addItem({
      id: '1',
      title: 'Digital Download - Software License',
      price: 49.99,
      sku: 'DL-001',
      stock: 999,
    });
    store.addItem({
      id: '2',
      title: 'Online Course Access',
      price: 99.99,
      sku: 'OC-002',
      stock: 999,
    });
    store.updateQuantity('1', 3);
  },
};
