import {
  CartQuery,
  ClearCartMutation,
  RemoveFromCartMutation,
  UpdateCartItemMutation,
} from '@custom/schema';
import Landscape from '@stories/landscape.jpg?as=metadata';
import Portrait from '@stories/portrait.jpg?as=metadata';
import type { Meta, StoryObj } from '@storybook/react';

import { image } from '../../helpers/image';
import { CartPage } from './CartPage';

const meta: Meta<typeof CartPage> = {
  title: 'Organisms/CartPage',
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

export const SingleItem: Story = {
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
              price: 299.99,
              quantity: 2,
              sku: 'SW-001',
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
              quantity: 2,
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
          ],
          totalItems: 7,
          totalPrice: 1339.95,
        },
      },
    } as const,
  },
};

export const WithoutBreadcrumbs: Story = {
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

export const WithoutCheckout: Story = {
  args: {
    onCheckout: undefined,
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

export const ExpensiveItems: Story = {
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
              title: 'Professional Camera Equipment',
              price: 2999.99,
              quantity: 2,
              sku: 'CAM-001',
              maxStock: 3,
              teaserImage: {
                alt: 'Professional Camera Equipment',
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
                source: image(Landscape, { width: 200, height: 200 }),
              },
            },
          ],
          totalItems: 3,
          totalPrice: 9499.97,
        },
      },
    } as const,
  },
};

export const ItemsWithoutImages: Story = {
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
              title: 'Digital Download - Software License',
              price: 49.99,
              quantity: 3,
              sku: 'DL-001',
              maxStock: 999,
            },
            {
              id: '2',
              title: 'Online Course Access',
              price: 99.99,
              quantity: 1,
              sku: 'OC-002',
              maxStock: 999,
            },
          ],
          totalItems: 4,
          totalPrice: 249.96,
        },
      },
    } as const,
  },
};
