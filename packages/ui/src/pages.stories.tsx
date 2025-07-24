import {
  AddToCartMutation,
  CartQuery,
  ClearCartMutation,
  ContentHubQuery,
  ContentHubTermsQuery,
  FrameQuery,
  RemoveFromCartMutation,
  UpdateCartItemMutation,
  ViewPageQuery,
  ViewProductQuery,
} from '@custom/schema';
import { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import CartPageStories from './components/Organisms/CartPage.stories';
import { WithResults } from './components/Organisms/ContentHub.stories';
import ProductDisplayStories from './components/Organisms/ProductDisplay.stories';
import { ContentHub } from './components/Routes/ContentHub';
import { Frame } from './components/Routes/Frame';
import { Default as FrameStory } from './components/Routes/Frame.stories';
import { Page } from './components/Routes/Page';
import { Default as PageStory } from './components/Routes/Page.stories';
import { Product } from './components/Routes/Product';
import { Default as ProductStory } from './components/Routes/Product.stories';

export default {
  title: 'Pages',
  parameters: {
    layout: 'fullscreen',
    chromatic: {
      // We don't want to snapshot page examples, that just causes a lot of noise.
      disableSnapshot: true,
    },
    executors: {
      [FrameQuery]: FrameStory.parameters.executors[FrameQuery],
      [CartQuery]: ProductDisplayStories.parameters?.executors?.[CartQuery],
      [AddToCartMutation]:
        ProductDisplayStories.parameters?.executors?.[AddToCartMutation],
      [UpdateCartItemMutation]:
        CartPageStories.parameters?.executors?.[UpdateCartItemMutation],
      [RemoveFromCartMutation]:
        CartPageStories.parameters?.executors?.[RemoveFromCartMutation],
      [ClearCartMutation]:
        CartPageStories.parameters?.executors?.[ClearCartMutation],
    },
  },
  decorators: [(Story, ctx) => <Frame>{Story(ctx)}</Frame>],
} satisfies Meta;

export const ContentPage = {
  render: () => <Page />,
  parameters: {
    executors: {
      [ViewPageQuery]: PageStory.parameters.executors[ViewPageQuery],
    },
  },
} satisfies StoryObj;

export const ContentHubPage = {
  render: () => <ContentHub pageSize={6} />,
  parameters: {
    executors: {
      [ContentHubQuery]: WithResults.parameters?.executors?.[ContentHubQuery],
      [ContentHubTermsQuery]:
        WithResults.parameters?.executors?.[ContentHubTermsQuery],
    },
  },
};

export const ProductPage = {
  render: () => <Product />,
  parameters: {
    executors: {
      [ViewProductQuery]: ProductStory.args,
    },
    location: ProductStory.parameters.location,
  },
} satisfies StoryObj;
