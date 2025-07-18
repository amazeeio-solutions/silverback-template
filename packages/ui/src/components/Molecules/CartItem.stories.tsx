import {
  CartQuery,
  RemoveFromCartMutation,
  UpdateCartItemMutation,
} from '@custom/schema';
import Portrait from '@stories/portrait.jpg?as=metadata';
import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/test';

import { image } from '../../helpers/image';
import { CartItem } from './CartItem';

type CartItemFromQuery = NonNullable<CartQuery['cart']['items'][0]>;

const meta: Meta<typeof CartItem> = {
  title: 'Molecules/CartItem',
  component: CartItem,
  parameters: {
    layout: 'padded',
    executors: {
      [UpdateCartItemMutation]: () => {},
      [RemoveFromCartMutation]: () => {},
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onRemove: { action: 'removed' },
    onUpdateQuantity: { action: 'quantity updated' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockCartItem: CartItemFromQuery = {
  id: '1',
  title: 'Premium Wireless Headphones',
  price: 199.99,
  quantity: 1,
  sku: 'WH-001',
  maxStock: 10,
  teaserImage: {
    alt: 'Premium Wireless Headphones',
    source: image(Portrait, { width: 200, height: 200 }),
  },
};

const mockCartItemWithoutImage: CartItemFromQuery = {
  id: '2',
  title: 'Digital Download - Software License',
  price: 49.99,
  quantity: 2,
  sku: 'DL-002',
  maxStock: 999,
};

export const Default: Story = {
  args: {
    item: mockCartItem,
  },
};

export const WithoutImage: Story = {
  args: {
    item: mockCartItemWithoutImage,
    showImage: false,
  },
};

export const CompactView: Story = {
  args: {
    item: mockCartItem,
    compact: true,
  },
};

export const MultipleQuantity: Story = {
  args: {
    item: {
      ...mockCartItem,
      quantity: 3,
    },
  },
};

export const LowStock: Story = {
  args: {
    item: {
      ...mockCartItem,
      quantity: 2,
      maxStock: 3,
    },
  },
};

export const MaxStock: Story = {
  args: {
    item: {
      ...mockCartItem,
      quantity: 5,
      maxStock: 5,
    },
  },
};

export const ExpensiveItem: Story = {
  args: {
    item: {
      ...mockCartItem,
      title: 'Professional Camera Equipment',
      price: 2999.99,
      quantity: 1,
      sku: 'CAM-PRO-001',
    },
  },
};

export const LongTitle: Story = {
  args: {
    item: {
      ...mockCartItem,
      title:
        'Ultra-Premium Noise-Cancelling Wireless Bluetooth Headphones with Active Noise Reduction Technology',
      sku: 'LONG-TITLE-001',
    },
  },
};

export const CompactWithoutImage: Story = {
  args: {
    item: mockCartItemWithoutImage,
    compact: true,
    showImage: false,
  },
};

export const InteractionTests = {
  parameters: {
    executors: {
      [UpdateCartItemMutation]: async (variables: unknown) => {
        action('UpdateCartItemMutation')(variables);
        return { updateCartItem: { success: true } };
      },
      [RemoveFromCartMutation]: async (variables: unknown) => {
        action('RemoveFromCartMutation')(variables);
        return { removeFromCart: { success: true } };
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test increasing quantity
    const increaseButton = canvas.getByLabelText('Increase quantity');
    await userEvent.click(increaseButton);

    // Test decreasing quantity
    const decreaseButton = canvas.getByLabelText('Decrease quantity');
    await userEvent.click(decreaseButton);

    // Test removing item
    const removeButton = canvas.getByLabelText('Remove item');
    await userEvent.click(removeButton);
  },
} satisfies Story;
