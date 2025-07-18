import {
  CartQuery,
  ClearCartMutation,
  RemoveFromCartMutation,
  UpdateCartItemMutation,
} from '@custom/schema';
import Landscape from '@stories/landscape.jpg?as=metadata';
import type { Meta, StoryObj } from '@storybook/react';

import { image } from '../../helpers/image';
import { CartPage } from '../Organisms/CartPage';

const meta: Meta<typeof CartPage> = {
  title: 'Routes/Cart',
  component: CartPage,
  parameters: {
    layout: 'fullscreen',
    executors: {
      [ClearCartMutation]: () => {},
      [UpdateCartItemMutation]: () => {},
      [RemoveFromCartMutation]: () => {},
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    showBreadcrumbs: false,
  },
  parameters: {
    executors: {
      [CartQuery]: {
        cart: {
          items: [
            {
              id: '1',
              title: 'Premium Wireless Headphones',
              price: 199.99,
              quantity: 2,
              sku: 'WH-001',
              maxStock: 10,
              teaserImage: {
                alt: 'Premium Wireless Headphones',
                source: image(Landscape, { width: 200, height: 200 }),
              },
            },
            {
              id: '2',
              title: 'Smart Watch',
              price: 299.99,
              quantity: 1,
              sku: 'SW-002',
              maxStock: 5,
              teaserImage: {
                alt: 'Smart Watch',
                source: image(Landscape, { width: 200, height: 200 }),
              },
            },
          ],
          totalItems: 3,
          totalPrice: 699.97,
        },
      },
    } as const,
  },
};

export const EmptyCart: Story = {
  args: {
    showBreadcrumbs: false,
  },
  parameters: {
    executors: {
      [CartQuery]: {
        cart: {
          items: [],
          totalItems: 0,
          totalPrice: 0,
        },
      },
    } as const,
  },
};
