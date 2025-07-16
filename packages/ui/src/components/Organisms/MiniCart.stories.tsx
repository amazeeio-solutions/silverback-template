import Portrait from '@stories/portrait.jpg?as=metadata';
import type { Meta, StoryObj } from '@storybook/react';

import { image } from '../../helpers/image';
import { useCartStore } from '../../stores/cart';
import { MiniCart } from './MiniCart';

const meta: Meta<typeof MiniCart> = {
  title: 'Organisms/MiniCart',
  component: MiniCart,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    onClose: { action: 'close' },
    onViewCart: { action: 'view cart' },
    onCheckout: { action: 'checkout' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOpen: true,
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
        source: image(Portrait, { width: 200, height: 200 }),
      },
    });
  },
};

export const EmptyCart: Story = {
  args: {
    isOpen: true,
  },
  play: async () => {
    const store = useCartStore.getState();
    store.clearCart();
  },
};

export const SingleItem: Story = {
  args: {
    isOpen: true,
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
    isOpen: true,
  },
  play: async () => {
    const store = useCartStore.getState();
    store.clearCart();

    const items = [
      {
        id: '1',
        title: 'Premium Wireless Headphones',
        price: 199.99,
        sku: 'WH-001',
      },
      { id: '2', title: 'Smart Watch', price: 299.99, sku: 'SW-002' },
      { id: '3', title: 'Bluetooth Speaker', price: 79.99, sku: 'BS-003' },
      { id: '4', title: 'Wireless Charger', price: 39.99, sku: 'WC-004' },
      { id: '5', title: 'Phone Case', price: 19.99, sku: 'PC-005' },
      { id: '6', title: 'Screen Protector', price: 9.99, sku: 'SP-006' },
    ];

    items.forEach((item) => {
      store.addItem({
        ...item,
        stock: 10,
        teaserImage: {
          alt: item.title,
          source: image(Portrait, { width: 200, height: 200 }),
        },
      });
    });
  },
};

export const WithoutCheckout: Story = {
  args: {
    isOpen: true,
    onCheckout: undefined,
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

export const Closed: Story = {
  args: {
    isOpen: false,
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
    });
  },
};

export const ExpensiveItems: Story = {
  args: {
    isOpen: true,
  },
  play: async () => {
    const store = useCartStore.getState();
    store.clearCart();
    store.addItem({
      id: '1',
      title: 'Professional Camera',
      price: 2999.99,
      sku: 'CAM-001',
      stock: 3,
      teaserImage: {
        alt: 'Professional Camera',
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
        source: image(Portrait, { width: 200, height: 200 }),
      },
    });
  },
};
