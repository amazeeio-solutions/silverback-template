import {
  FrameQuery,
  Locale,
  Markup,
  OperationExecutorsProvider,
  Url,
  ViewProductQuery,
} from '@custom/schema';
import Landscape from '@stories/landscape.jpg?as=metadata';
import Portrait from '@stories/portrait.jpg?as=metadata';
import { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { image } from '../../helpers/image';
import { Default as FrameStory } from './Frame.stories';
import { Product } from './Product';

export default {
  component: Product,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Product>;

export const Default = {
  render: (args) => {
    return (
      <OperationExecutorsProvider
        executors={[
          { executor: args, id: ViewProductQuery },
          { id: FrameQuery, executor: FrameStory.args },
        ]}
      >
        <Product />
      </OperationExecutorsProvider>
    );
  },
  args: {
    product: {
      id: 'product-1',
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
    },
  },
  parameters: {
    location: new URL('local:/products/wireless-headphones'),
  },
} satisfies StoryObj<ViewProductQuery>;

export const WithHero = {
  ...Default,
  args: {
    ...Default.args,
    product: {
      ...Default.args.product,
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
  },
} satisfies StoryObj<ViewProductQuery>;

export const OutOfStock = {
  ...Default,
  args: {
    ...Default.args,
    product: {
      ...Default.args.product,
      title: 'Out of Stock Headphones',
      stock: 0,
      sku: 'WBH-2024-OOS',
    },
  },
} satisfies StoryObj<ViewProductQuery>;

export const HighPriceProduct = {
  ...Default,
  args: {
    ...Default.args,
    product: {
      ...Default.args.product,
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
  },
} satisfies StoryObj<ViewProductQuery>;

export const GamingKeyboard = {
  ...Default,
  args: {
    ...Default.args,
    product: {
      ...Default.args.product,
      id: 'product-2',
      path: '/products/gaming-keyboard' as Url,
      title: 'Gaming Mechanical Keyboard',
      teaserImage: {
        source: image(Portrait, { width: 600, height: 600 }),
        alt: 'RGB gaming keyboard',
      },
      description:
        'Professional gaming keyboard with RGB backlighting and mechanical switches for enhanced performance and durability.' as Markup,
      price: 89.99,
      sku: 'GMK-2024-002',
      stock: 15,
      translations: [
        {
          locale: Locale.En,
          path: '/products/gaming-keyboard' as Url,
        },
      ],
    },
  },
  parameters: {
    location: new URL('local:/products/gaming-keyboard'),
  },
} satisfies StoryObj<ViewProductQuery>;
