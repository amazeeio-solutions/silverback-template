import {
  AddToCartMutation,
  CartQuery,
  ClearCartMutation,
  FrameQuery,
  Locale,
  Markup,
  ProductFragment,
  RemoveFromCartMutation,
  UpdateCartItemMutation,
  Url,
} from '@custom/schema';
import Landscape from '@stories/landscape.jpg?as=metadata';
import Portrait from '@stories/portrait.jpg?as=metadata';
import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react';

import { image } from '../../helpers/image';
import { ProductDisplay } from './ProductDisplay';

const meta: Meta<typeof ProductDisplay> = {
  title: 'Organisms/ProductDisplay',
  component: ProductDisplay,
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
      [CartQuery]: {
        cart: {
          items: [],
          totalItems: 0,
          totalPrice: 0,
        },
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
      [FrameQuery]: {
        navigation: {
          main: [],
        },
        footer: {
          links: [],
        },
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockProduct: ProductFragment = {
  id: 'product-1',
  uuid: 'product-1',
  locale: 'en',
  path: '/products/wireless-headphones' as Url,
  editLink: {
    type: 'drupal',
    url: '/admin/content/product/1/edit' as Url,
  },
  translations: [
    {
      locale: Locale.En,
      path: '/products/wireless-headphones' as Url,
    },
  ],
  title: 'Wireless Bluetooth Headphones',
  teaserImage: {
    source: image(Landscape, { width: 600, height: 600 }),
    alt: 'Premium wireless headphones',
  },
  hero: undefined,
  description:
    `Experience premium sound quality with these advanced wireless Bluetooth headphones. Features include:

• Active noise cancellation technology
• 30-hour battery life with quick charge capability  
• Premium memory foam ear cushions for all-day comfort
• Built-in microphone for crystal clear calls
• Compatible with all Bluetooth-enabled devices
• Lightweight design with foldable construction

Perfect for music lovers, professionals, and anyone who values exceptional audio quality.` as Markup,
  price: 149.99,
  sku: 'WBH-2024-001',
  stock: 25,
  metaTags: [
    {
      tag: 'meta',
      attributes: {
        name: 'description',
        content:
          'Premium wireless Bluetooth headphones with noise cancellation',
        property: undefined,
        rel: undefined,
        href: undefined,
      },
    },
  ],
  terms: [
    {
      termId: 'demo',
      depth: 0,
      label: 'Demo',
      locale: Locale.En,
    },
  ],
};

export const Default: Story = {
  args: mockProduct,
};

export const WithHero: Story = {
  args: {
    ...mockProduct,
    hero: {
      headline: 'Premium Sound Experience',
      lead: 'Experience superior audio quality with advanced noise cancellation technology.',
      image: {
        landscape: image(Landscape, { width: 2000, height: 500 }),
        portrait: image(Portrait, { width: 1200, height: 2400 }),
        alt: 'Wireless headphones hero image',
      },
      ctaText: 'Shop Now',
      ctaUrl: '/products/wireless-headphones' as Url,
      formUrl: undefined,
    },
  },
};

export const OutOfStock: Story = {
  args: {
    ...mockProduct,
    title: 'Out of Stock Headphones',
    stock: 0,
    sku: 'WBH-2024-OOS',
  },
};

export const ExpensiveProduct: Story = {
  args: {
    ...mockProduct,
    title: 'Premium Studio Headphones',
    price: 1299.0,
    sku: 'PSH-2024-001',
    description:
      'Professional studio-grade headphones used by industry professionals worldwide. Features include premium drivers, studio-quality sound reproduction, and professional-grade construction.' as Markup,
    teaserImage: {
      source: image(Portrait, { width: 600, height: 600 }),
      alt: 'Premium studio headphones',
    },
  },
};

export const WithoutImage: Story = {
  args: {
    ...mockProduct,
    title: 'Digital Download - Software License',
    price: 49.99,
    sku: 'DL-001',
    teaserImage: undefined,
    description:
      'Digital software license for premium audio editing software. Instant download upon purchase.' as Markup,
  },
};

export const LowStock: Story = {
  args: {
    ...mockProduct,
    title: 'Limited Edition Headphones',
    stock: 3,
    sku: 'LEH-2024-001',
    description:
      'Limited edition wireless headphones with custom design. Only 3 units remaining!' as Markup,
  },
};

export const WithProductInCart: Story = {
  args: mockProduct,
  parameters: {
    executors: {
      [AddToCartMutation]: async (variables: {
        input?: { productId?: string };
      }) => {
        action('AddToCartMutation - With Product Already In Cart')(variables);
        return {
          addToCart: {
            cart: {
              items: [
                {
                  id: variables?.input?.productId || 'product-1',
                  title: 'Wireless Bluetooth Headphones',
                  price: 149.99,
                  quantity: 3, // Increased quantity
                  sku: 'WBH-2024-001',
                  maxStock: 25,
                  teaserImage: {
                    source: image(Portrait, { width: 200, height: 200 }),
                    alt: 'Premium wireless headphones',
                  },
                },
              ],
              totalItems: 3,
              totalPrice: 449.97,
            },
            errors: [],
          },
        };
      },
      [CartQuery]: {
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
      },
    },
  },
};

export const LongDescription: Story = {
  args: {
    ...mockProduct,
    title: 'Professional Audio Equipment',
    description:
      `This is a comprehensive professional audio solution designed for the most demanding audio professionals and enthusiasts.

**Key Features:**
• **Superior Sound Quality**: Experience unparalleled audio fidelity with our custom-engineered drivers
• **Advanced Noise Cancellation**: Industry-leading active noise cancellation technology
• **Long Battery Life**: Up to 40 hours of continuous playback
• **Quick Charge**: 15 minutes of charging provides 3 hours of playback
• **Premium Materials**: Crafted with aircraft-grade aluminum and premium leather
• **Wireless Freedom**: Latest Bluetooth 5.2 technology with multipoint connection
• **Professional Controls**: Intuitive touch controls with customizable gestures
• **Voice Assistant Ready**: Compatible with Siri, Google Assistant, and Alexa

**Technical Specifications:**
- Frequency Response: 5Hz - 40kHz
- Impedance: 32 ohms
- Driver Size: 50mm dynamic drivers
- Weight: 285g
- Charging Port: USB-C with fast charging support
- Included Accessories: Carrying case, charging cable, 3.5mm audio cable

**Perfect For:**
- Music production and mixing
- Critical listening sessions  
- Long-distance travel
- Professional audio work
- Audiophile listening experiences

This product represents the pinnacle of audio engineering and is trusted by professionals worldwide.` as Markup,
  },
};
