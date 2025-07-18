import {
  CartQuery,
  RemoveFromCartMutation,
  UpdateCartItemMutation,
} from '@custom/schema';
import Portrait from '@stories/portrait.jpg?as=metadata';
import type { Meta, StoryObj } from '@storybook/react';

import { image } from '../../helpers/image';
import { MiniCart } from './MiniCart';

const meta: Meta<typeof MiniCart> = {
  title: 'Organisms/MiniCart',
  component: MiniCart,
  parameters: {
    layout: 'fullscreen',
    executors: {
      [UpdateCartItemMutation]: () => {},
      [RemoveFromCartMutation]: () => {},
    },
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
  parameters: {
    location: new URL('local:/#cart'),
    executors: {
      [CartQuery]: {
        cart: {
          items: [
            {
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
                source: image(Portrait, { width: 200, height: 200 }),
              },
            },
          ],
          totalItems: 2,
          totalPrice: 499.98,
        },
      },
    } as const,
  },
};

export const EmptyCart: Story = {
  parameters: {
    location: new URL('local:/#cart'),
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

export const SingleItem: Story = {
  parameters: {
    location: new URL('local:/#cart'),
    executors: {
      [CartQuery]: {
        cart: {
          items: [
            {
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
            },
          ],
          totalItems: 1,
          totalPrice: 199.99,
        },
      },
    } as const,
  },
};

export const ManyItems: Story = {
  parameters: {
    location: new URL('local:/#cart'),
    executors: {
      [CartQuery]: {
        cart: {
          items: [
            {
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
            },
            {
              id: '2',
              title: 'Smart Watch',
              price: 299.99,
              quantity: 1,
              sku: 'SW-002',
              maxStock: 10,
              teaserImage: {
                alt: 'Smart Watch',
                source: image(Portrait, { width: 200, height: 200 }),
              },
            },
            {
              id: '3',
              title: 'Bluetooth Speaker',
              price: 79.99,
              quantity: 1,
              sku: 'BS-003',
              maxStock: 10,
              teaserImage: {
                alt: 'Bluetooth Speaker',
                source: image(Portrait, { width: 200, height: 200 }),
              },
            },
            {
              id: '4',
              title: 'Wireless Charger',
              price: 39.99,
              quantity: 1,
              sku: 'WC-004',
              maxStock: 10,
              teaserImage: {
                alt: 'Wireless Charger',
                source: image(Portrait, { width: 200, height: 200 }),
              },
            },
            {
              id: '5',
              title: 'Phone Case',
              price: 19.99,
              quantity: 1,
              sku: 'PC-005',
              maxStock: 10,
              teaserImage: {
                alt: 'Phone Case',
                source: image(Portrait, { width: 200, height: 200 }),
              },
            },
            {
              id: '6',
              title: 'Screen Protector',
              price: 9.99,
              quantity: 1,
              sku: 'SP-006',
              maxStock: 10,
              teaserImage: {
                alt: 'Screen Protector',
                source: image(Portrait, { width: 200, height: 200 }),
              },
            },
          ],
          totalItems: 6,
          totalPrice: 649.94,
        },
      },
    } as const,
  },
};

export const WithoutCheckout: Story = {
  args: {
    onCheckout: undefined,
  },
  parameters: {
    location: new URL('local:/#cart'),
    executors: {
      [CartQuery]: {
        cart: {
          items: [
            {
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
            },
          ],
          totalItems: 1,
          totalPrice: 199.99,
        },
      },
    } as const,
  },
};

export const Closed: Story = {
  parameters: {
    location: new URL('local:/'),
    executors: {
      [CartQuery]: {
        cart: {
          items: [
            {
              id: '1',
              title: 'Premium Wireless Headphones',
              price: 199.99,
              quantity: 1,
              sku: 'WH-001',
              maxStock: 10,
              teaserImage: {
                alt: 'Premium Wireless Headphones',
                source: '/headphones.jpg',
              },
            },
          ],
          totalItems: 1,
          totalPrice: 199.99,
        },
      },
    } as const,
  },
};

export const ExpensiveItems: Story = {
  parameters: {
    location: new URL('local:/#cart'),
    executors: {
      [CartQuery]: {
        cart: {
          items: [
            {
              id: '1',
              title: 'Professional Camera',
              price: 2999.99,
              quantity: 1,
              sku: 'CAM-001',
              maxStock: 3,
              teaserImage: {
                alt: 'Professional Camera',
                source: image(Portrait, { width: 200, height: 200 }),
              },
            },
            {
              id: '2',
              title: 'High-End Laptop',
              price: 3499.99,
              quantity: 1,
              sku: 'LAP-002',
              maxStock: 2,
              teaserImage: {
                alt: 'High-End Laptop',
                source: image(Portrait, { width: 200, height: 200 }),
              },
            },
          ],
          totalItems: 2,
          totalPrice: 6499.98,
        },
      },
    } as const,
  },
};
