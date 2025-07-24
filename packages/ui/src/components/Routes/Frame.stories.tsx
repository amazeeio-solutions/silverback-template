import {
  AddToCartMutation,
  CartQuery,
  ClearCartMutation,
  FrameQuery,
  RemoveFromCartMutation,
  UpdateCartItemMutation,
} from '@custom/schema';
import { Meta, StoryObj } from '@storybook/react';

import CartPageStories from '../Organisms/CartPage.stories';
import { Footer as FooterStory } from '../Organisms/Footer.stories';
import { Idle as HeaderStory } from '../Organisms/Header.stories';
import ProductDisplayStories from '../Organisms/ProductDisplay.stories';
import { Frame } from './Frame';

export default {
  component: Frame,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Frame>;

export const Default = {
  parameters: {
    executors: {
      [FrameQuery]: {
        mainNavigation:
          HeaderStory.parameters.executors[FrameQuery].mainNavigation,
        footerNavigation:
          FooterStory.parameters.executors[FrameQuery].footerNavigation,
        metaNavigation:
          HeaderStory.parameters.executors[FrameQuery].metaNavigation,
        stringTranslations: [],
      },
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
} satisfies StoryObj<FrameQuery>;
