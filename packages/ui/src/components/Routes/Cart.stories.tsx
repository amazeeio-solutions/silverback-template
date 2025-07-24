import {
  AddToCartMutation,
  CartQuery,
  ClearCartMutation,
  RemoveFromCartMutation,
  UpdateCartItemMutation,
} from '@custom/schema';
import Landscape from '@stories/landscape.jpg?as=metadata';
import Portrait from '@stories/portrait.jpg?as=metadata';
import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react';

import { image } from '../../helpers/image';
import { CartPage } from '../Organisms/CartPage';

const meta: Meta<typeof CartPage> = {
  title: 'Routes/Cart',
  component: CartPage,
  parameters: {
    layout: 'fullscreen',
    executors: {
      [AddToCartMutation]: async (variables: {
        input?: { productId?: string };
      }) => {
        action('AddToCartMutation')(variables);
        return {
          addToCart: {
            cart: {
              items: [
                {
                  id: variables?.input?.productId || 'product-1',
                  title: 'Wireless Bluetooth Headphones',
                  price: 149.99,
                  quantity: 1,
                  sku: 'WBH-2024-001',
                  maxStock: 25,
                  teaserImage: {
                    source: image(Portrait, { width: 200, height: 200 }),
                    alt: 'Premium wireless headphones',
                  },
                },
              ],
              totalItems: 1,
              totalPrice: 149.99,
            },
            errors: [],
          },
        };
      },
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
      [AddToCartMutation]: async (variables: {
        input?: { productId?: string };
      }) => {
        action('AddToCartMutation - EmptyCart')(variables);
        return {
          addToCart: {
            cart: {
              items: [
                {
                  id: variables?.input?.productId || 'product-1',
                  title: 'Wireless Bluetooth Headphones',
                  price: 149.99,
                  quantity: 1,
                  sku: 'WBH-2024-001',
                  maxStock: 25,
                  teaserImage: {
                    source: image(Portrait, { width: 200, height: 200 }),
                    alt: 'Premium wireless headphones',
                  },
                },
              ],
              totalItems: 1,
              totalPrice: 149.99,
            },
            errors: [],
          },
        };
      },
      [ClearCartMutation]: () => {},
      [UpdateCartItemMutation]: () => {},
      [RemoveFromCartMutation]: () => {},
    } as const,
  },
};
