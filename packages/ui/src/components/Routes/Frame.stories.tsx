import { CartQuery, FrameQuery } from '@custom/schema';
import { Meta, StoryObj } from '@storybook/react';

import { Footer as FooterStory } from '../Organisms/Footer.stories';
import { Idle as HeaderStory } from '../Organisms/Header.stories';
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
      [CartQuery]: {
        cart: {
          items: [],
          totalItems: 0,
          totalPrice: 0,
        },
      },
    },
  },
} satisfies StoryObj<FrameQuery>;
