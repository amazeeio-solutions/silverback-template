import { Url } from '@custom/schema';
import Landscape from '@stories/landscape.jpg?as=metadata';
import Portrait from '@stories/portrait.jpg?as=metadata';
import { Meta, StoryObj } from '@storybook/react';

import { image } from '../../helpers/image';
import { CardItem } from './CardItem';

export default {
  component: CardItem,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof CardItem>;

export const PageCard = {
  args: {
    id: 'page-1',
    path: '/about-us' as Url,
    title: 'About Our Company',
    hero: {
      headline: 'Company Overview',
      lead: 'Learn more about our mission and values',
    },
    teaserImage: {
      alt: 'Company team photo',
      source: image(Landscape, { width: 400, height: 300 }),
    },
    terms: [
      {
        label: 'Company',
        termId: 'company',
        depth: 0,
      },
    ],
    readMoreText: 'Learn More',
  },
} satisfies StoryObj<typeof CardItem>;

export const ProductCard = {
  args: {
    id: 'product-1',
    path: '/products/wireless-headphones' as Url,
    title: 'Wireless Bluetooth Headphones',
    hero: {
      headline: 'Premium Audio',
      lead: 'Experience superior sound quality with noise cancellation',
    },
    teaserImage: {
      alt: 'Wireless headphones',
      source: image(Portrait, { width: 400, height: 300 }),
    },
    price: 149.99,
    sku: 'WBH-2024-001',
    stock: 25,
    terms: [
      {
        label: 'Electronics',
        termId: 'electronics',
        depth: 0,
      },
    ],
    readMoreText: 'Shop Now',
  },
} satisfies StoryObj<typeof CardItem>;

export const OutOfStockProduct = {
  args: {
    ...ProductCard.args,
    title: 'Gaming Mechanical Keyboard',
    price: 89.99,
    sku: 'GMK-2024-002',
    stock: 0,
    hero: {
      headline: 'Gaming Gear',
      lead: 'Professional gaming with RGB backlighting',
    },
    teaserImage: {
      alt: 'Gaming keyboard',
      source: image(Landscape, { width: 400, height: 300 }),
    },
  },
} satisfies StoryObj<typeof CardItem>;

export const HighPriceProduct = {
  args: {
    ...ProductCard.args,
    title: 'Premium Studio Headphones',
    price: 1299.0,
    sku: 'PSH-2024-001',
    stock: 5,
    hero: {
      headline: 'Professional Audio',
      lead: 'Studio-grade quality for professionals',
    },
  },
} satisfies StoryObj<typeof CardItem>;
