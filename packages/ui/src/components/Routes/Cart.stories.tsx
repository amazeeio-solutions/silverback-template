import { ImageSource } from '@custom/schema';
import type { Meta, StoryObj } from '@storybook/react';

import { useCartStore } from '../../stores/cart';
import { CartPage } from '../Organisms/CartPage';

const meta: Meta<typeof CartPage> = {
  title: 'Routes/Cart',
  component: CartPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
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
        source: 'https://picsum.photos/200/200?random=1' as ImageSource,
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
        source: 'https://picsum.photos/200/200?random=2' as ImageSource,
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
