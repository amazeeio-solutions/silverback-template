import {
  BlockTeaserListLayout,
  OperationExecutorsProvider,
  TeaserListQuery,
  Url,
} from '@custom/schema';
import Landscape from '@stories/landscape.jpg?as=metadata';
import Portrait from '@stories/portrait.jpg?as=metadata';
import { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { image } from '../../../helpers/image';
import { BlockTeaserList } from './BlockTeaserList';

export default {
  component: BlockTeaserList,
  decorators: [
    (Story) => (
      <OperationExecutorsProvider
        executors={[
          {
            id: TeaserListQuery,
            executor: PagesData,
          },
        ]}
      >
        <Story />
      </OperationExecutorsProvider>
    ),
  ],
} satisfies Meta<typeof BlockTeaserList>;

// Mock data for Pages
const PagesData = {
  teaserList: {
    total: 4,
    items: [
      {
        id: 'page-1',
        path: '/page-1' as Url,
        title: 'Sample Blog Post',
        hero: {
          lead: 'Discover the latest insights and trends in web development',
          headline: 'Web Development Blog',
        },
        teaserImage: {
          alt: 'Blog post image',
          source: image(Landscape, { width: 400, height: 300 }),
        },
        terms: [
          {
            label: 'Blog',
            termId: 'blog',
            depth: 0,
          },
        ],
      },
      {
        id: 'page-2',
        path: '/page-2' as Url,
        title: 'About Our Company',
        hero: {
          lead: 'Learn more about our mission and values',
          headline: 'Company Information',
        },
        teaserImage: {
          alt: 'Company image',
          source: image(Portrait, { width: 400, height: 300 }),
        },
        terms: [
          {
            label: 'Page',
            termId: 'page',
            depth: 0,
          },
        ],
      },
    ],
  },
};

// Mock data for Products
const ProductsData = {
  teaserList: {
    total: 3,
    items: [
      {
        id: 'product-1',
        path: '/products/wireless-headphones' as Url,
        title: 'Wireless Bluetooth Headphones',
        hero: {
          lead: 'Premium sound quality with noise cancellation',
          headline: 'Audio Excellence',
        },
        teaserImage: {
          alt: 'Wireless headphones',
          source: image(Landscape, { width: 400, height: 300 }),
        },
        price: 149.99,
        sku: 'WBH-2024-001',
        stock: 25,
        terms: [
          {
            label: 'Demo',
            termId: 'demo',
            depth: 0,
          },
        ],
      },
      {
        id: 'product-2',
        path: '/products/gaming-keyboard' as Url,
        title: 'Gaming Mechanical Keyboard',
        hero: {
          lead: 'Professional gaming with RGB backlighting',
          headline: 'Gaming Gear',
        },
        teaserImage: {
          alt: 'Gaming keyboard',
          source: image(Portrait, { width: 400, height: 300 }),
        },
        price: 89.99,
        sku: 'GMK-2024-002',
        stock: 15,
        terms: [
          {
            label: 'Demo',
            termId: 'demo',
            depth: 0,
          },
        ],
      },
      {
        id: 'product-3',
        path: '/products/wireless-mouse' as Url,
        title: 'Wireless Gaming Mouse',
        hero: {
          lead: 'Precision and performance for competitive gaming',
          headline: 'Gaming Precision',
        },
        teaserImage: {
          alt: 'Gaming mouse',
          source: image(Landscape, { width: 400, height: 300 }),
        },
        price: 79.99,
        sku: 'WGM-2024-003',
        stock: 0,
        terms: [
          {
            label: 'Demo',
            termId: 'demo',
            depth: 0,
          },
        ],
      },
    ],
  },
};

export const StaticPagesGrid = {
  args: {
    layout: BlockTeaserListLayout.Grid,
    buttonText: 'Read More',
    staticContent: [
      {
        __typename: 'BlockTeaserItem',
        content: PagesData.teaserList.items[0],
      },
      {
        __typename: 'BlockTeaserItem',
        content: PagesData.teaserList.items[1],
      },
    ],
    contentHubEnabled: false,
    filters: undefined,
  },
} satisfies StoryObj<typeof BlockTeaserList>;

export const StaticProductsGrid = {
  args: {
    layout: BlockTeaserListLayout.Grid,
    buttonText: 'Shop Now',
    staticContent: [
      {
        __typename: 'BlockTeaserItem',
        content: ProductsData.teaserList.items[0],
      },
      {
        __typename: 'BlockTeaserItem',
        content: ProductsData.teaserList.items[1],
      },
    ],
    contentHubEnabled: false,
    filters: undefined,
  },
} satisfies StoryObj<typeof BlockTeaserList>;

export const DynamicPagesGrid = {
  args: {
    layout: BlockTeaserListLayout.Grid,
    buttonText: 'Read More',
    staticContent: [],
    contentHubEnabled: true,
    filters: {
      title: '',
      limit: '6',
    },
  },
} satisfies StoryObj<typeof BlockTeaserList>;

export const DynamicProductsGrid = {
  args: {
    layout: BlockTeaserListLayout.Grid,
    buttonText: 'Shop Now',
    staticContent: [],
    contentHubEnabled: true,
    filters: {
      title: '',
      limit: '6',
    },
  },
} satisfies StoryObj<typeof BlockTeaserList>;

export const MixedContentGrid = {
  args: {
    layout: BlockTeaserListLayout.Grid,
    buttonText: 'Learn More',
    staticContent: [
      {
        __typename: 'BlockTeaserItem',
        content: PagesData.teaserList.items[0],
      },
      {
        __typename: 'BlockTeaserItem',
        content: ProductsData.teaserList.items[0],
      },
    ],
    contentHubEnabled: true,
    filters: {
      title: '',
      limit: '4',
    },
  },
} satisfies StoryObj<typeof BlockTeaserList>;

export const ProductsCarousel = {
  args: {
    layout: BlockTeaserListLayout.Carousel,
    buttonText: 'Shop Now',
    staticContent: [
      {
        __typename: 'BlockTeaserItem',
        content: ProductsData.teaserList.items[0],
      },
      {
        __typename: 'BlockTeaserItem',
        content: ProductsData.teaserList.items[1],
      },
    ],
    contentHubEnabled: true,
    filters: {
      title: '',
      limit: '8',
    },
  },
} satisfies StoryObj<typeof BlockTeaserList>;

export const PagesCarousel = {
  args: {
    layout: BlockTeaserListLayout.Carousel,
    buttonText: 'Read More',
    staticContent: [
      {
        __typename: 'BlockTeaserItem',
        content: PagesData.teaserList.items[0],
      },
      {
        __typename: 'BlockTeaserItem',
        content: PagesData.teaserList.items[1],
      },
    ],
    contentHubEnabled: true,
    filters: {
      title: '',
      limit: '8',
    },
  },
} satisfies StoryObj<typeof BlockTeaserList>;

export const WithFilters = {
  args: {
    layout: BlockTeaserListLayout.Grid,
    buttonText: 'Discover',
    staticContent: [],
    contentHubEnabled: true,
    filters: {
      title: 'Gaming',
      limit: '3',
    },
  },
} satisfies StoryObj<typeof BlockTeaserList>;
