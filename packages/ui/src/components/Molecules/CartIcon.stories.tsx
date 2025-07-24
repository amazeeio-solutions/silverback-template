import {
  AddToCartMutation,
  CartQuery,
  ClearCartMutation,
  RemoveFromCartMutation,
  UpdateCartItemMutation,
} from '@custom/schema';
import Portrait from '@stories/portrait.jpg?as=metadata';
import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react';

import { image } from '../../helpers/image';
import { CartIcon } from './CartIcon';

const meta: Meta<typeof CartIcon> = {
  title: 'Molecules/CartIcon',
  component: CartIcon,
  parameters: {
    layout: 'centered',
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
      [UpdateCartItemMutation]: async (variables: unknown) => {
        action('UpdateCartItemMutation')(variables);
        return {
          updateCartItem: {
            cart: {
              items: [
                {
                  id: 'product-1',
                  title: 'Wireless Bluetooth Headphones',
                  price: 149.99,
                  quantity: 2,
                  sku: 'WBH-2024-001',
                  maxStock: 25,
                  teaserImage: {
                    source: image(Portrait, { width: 200, height: 200 }),
                    alt: 'Premium wireless headphones',
                  },
                },
              ],
              totalItems: 2,
              totalPrice: 299.98,
            },
            errors: [],
          },
        };
      },
      [RemoveFromCartMutation]: async (variables: unknown) => {
        action('RemoveFromCartMutation')(variables);
        return {
          removeFromCart: {
            cart: {
              items: [],
              totalItems: 0,
              totalPrice: 0,
            },
            errors: [],
          },
        };
      },
      [ClearCartMutation]: async () => {
        action('ClearCartMutation')();
        return {
          clearCart: {
            cart: {
              items: [],
              totalItems: 0,
              totalPrice: 0,
            },
            errors: [],
          },
        };
      },
    } as const,
  },
  tags: ['autodocs'],
  argTypes: {
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithoutBadge: Story = {
  args: {
    showBadge: false,
  },
};

export const WithItems: Story = {
  args: {},
  parameters: {
    executors: {
      [CartQuery]: {
        cart: {
          items: [
            {
              id: '1',
              title: 'Test Product',
              price: 19.99,
              quantity: 1,
              sku: 'TEST-001',
              maxStock: 10,
              teaserImage: {
                alt: 'Test Product Image',
                source: '/test-product.jpg',
              },
            },
            {
              id: '2',
              title: 'Another Product',
              price: 29.99,
              quantity: 1,
              sku: 'TEST-002',
              maxStock: 5,
              teaserImage: {
                alt: 'Another Product Image',
                source: '/another-product.jpg',
              },
            },
          ],
          totalItems: 2,
          totalPrice: 49.98,
        },
      },
      [AddToCartMutation]: async (variables: {
        input?: { productId?: string };
      }) => {
        action('AddToCartMutation - story')(variables);
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
      [UpdateCartItemMutation]: async (variables: unknown) => {
        action('UpdateCartItemMutation - story')(variables);
        return {
          updateCartItem: {
            cart: {
              items: [
                {
                  id: 'product-1',
                  title: 'Wireless Bluetooth Headphones',
                  price: 149.99,
                  quantity: 2,
                  sku: 'WBH-2024-001',
                  maxStock: 25,
                  teaserImage: {
                    source: image(Portrait, { width: 200, height: 200 }),
                    alt: 'Premium wireless headphones',
                  },
                },
              ],
              totalItems: 2,
              totalPrice: 299.98,
            },
            errors: [],
          },
        };
      },
      [RemoveFromCartMutation]: async (variables: unknown) => {
        action('RemoveFromCartMutation - story')(variables);
        return {
          removeFromCart: {
            cart: {
              items: [],
              totalItems: 0,
              totalPrice: 0,
            },
            errors: [],
          },
        };
      },
      [ClearCartMutation]: async () => {
        action('ClearCartMutation - story')();
        return {
          clearCart: {
            cart: {
              items: [],
              totalItems: 0,
              totalPrice: 0,
            },
            errors: [],
          },
        };
      },
    } as const,
  },
};

export const WithManyItems: Story = {
  args: {},
  parameters: {
    executors: {
      [CartQuery]: {
        cart: {
          items: Array.from({ length: 25 }, (_, i) => ({
            id: `product-${i}`,
            title: `Product ${i}`,
            price: 9.99,
            quantity: 4,
            sku: `SKU-${i}`,
            maxStock: 100,
            teaserImage: {
              alt: `Product ${i} Image`,
              source: `/product-${i}.jpg`,
            },
          })),
          totalItems: 100,
          totalPrice: 999.0,
        },
      },
      [AddToCartMutation]: async (variables: {
        input?: { productId?: string };
      }) => {
        action('AddToCartMutation - story')(variables);
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
      [UpdateCartItemMutation]: async (variables: unknown) => {
        action('UpdateCartItemMutation - story')(variables);
        return {
          updateCartItem: {
            cart: {
              items: [
                {
                  id: 'product-1',
                  title: 'Wireless Bluetooth Headphones',
                  price: 149.99,
                  quantity: 2,
                  sku: 'WBH-2024-001',
                  maxStock: 25,
                  teaserImage: {
                    source: image(Portrait, { width: 200, height: 200 }),
                    alt: 'Premium wireless headphones',
                  },
                },
              ],
              totalItems: 2,
              totalPrice: 299.98,
            },
            errors: [],
          },
        };
      },
      [RemoveFromCartMutation]: async (variables: unknown) => {
        action('RemoveFromCartMutation - story')(variables);
        return {
          removeFromCart: {
            cart: {
              items: [],
              totalItems: 0,
              totalPrice: 0,
            },
            errors: [],
          },
        };
      },
      [ClearCartMutation]: async () => {
        action('ClearCartMutation - story')();
        return {
          clearCart: {
            cart: {
              items: [],
              totalItems: 0,
              totalPrice: 0,
            },
            errors: [],
          },
        };
      },
    } as const,
  },
};

export const EmptyCart: Story = {
  args: {},
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
        action('AddToCartMutation - story')(variables);
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
      [UpdateCartItemMutation]: async (variables: unknown) => {
        action('UpdateCartItemMutation - story')(variables);
        return {
          updateCartItem: {
            cart: {
              items: [
                {
                  id: 'product-1',
                  title: 'Wireless Bluetooth Headphones',
                  price: 149.99,
                  quantity: 2,
                  sku: 'WBH-2024-001',
                  maxStock: 25,
                  teaserImage: {
                    source: image(Portrait, { width: 200, height: 200 }),
                    alt: 'Premium wireless headphones',
                  },
                },
              ],
              totalItems: 2,
              totalPrice: 299.98,
            },
            errors: [],
          },
        };
      },
      [RemoveFromCartMutation]: async (variables: unknown) => {
        action('RemoveFromCartMutation - story')(variables);
        return {
          removeFromCart: {
            cart: {
              items: [],
              totalItems: 0,
              totalPrice: 0,
            },
            errors: [],
          },
        };
      },
      [ClearCartMutation]: async () => {
        action('ClearCartMutation - story')();
        return {
          clearCart: {
            cart: {
              items: [],
              totalItems: 0,
              totalPrice: 0,
            },
            errors: [],
          },
        };
      },
    } as const,
  },
};

export const CustomStyling: Story = {
  args: {
    className: 'text-blue-600 hover:bg-blue-50',
  },
  parameters: {
    executors: {
      [CartQuery]: {
        cart: {
          items: [
            {
              id: '1',
              title: 'Test Product',
              price: 19.99,
              quantity: 1,
              sku: 'TEST-001',
              maxStock: 10,
              teaserImage: {
                alt: 'Test Product Image',
                source: '/test-product.jpg',
              },
            },
          ],
          totalItems: 1,
          totalPrice: 19.99,
        },
      },
      [AddToCartMutation]: async (variables: {
        input?: { productId?: string };
      }) => {
        action('AddToCartMutation - story')(variables);
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
      [UpdateCartItemMutation]: async (variables: unknown) => {
        action('UpdateCartItemMutation - story')(variables);
        return {
          updateCartItem: {
            cart: {
              items: [
                {
                  id: 'product-1',
                  title: 'Wireless Bluetooth Headphones',
                  price: 149.99,
                  quantity: 2,
                  sku: 'WBH-2024-001',
                  maxStock: 25,
                  teaserImage: {
                    source: image(Portrait, { width: 200, height: 200 }),
                    alt: 'Premium wireless headphones',
                  },
                },
              ],
              totalItems: 2,
              totalPrice: 299.98,
            },
            errors: [],
          },
        };
      },
      [RemoveFromCartMutation]: async (variables: unknown) => {
        action('RemoveFromCartMutation - story')(variables);
        return {
          removeFromCart: {
            cart: {
              items: [],
              totalItems: 0,
              totalPrice: 0,
            },
            errors: [],
          },
        };
      },
      [ClearCartMutation]: async () => {
        action('ClearCartMutation - story')();
        return {
          clearCart: {
            cart: {
              items: [],
              totalItems: 0,
              totalPrice: 0,
            },
            errors: [],
          },
        };
      },
    } as const,
  },
};
