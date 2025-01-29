import { Markup } from '@custom/schema';
import Avatar from '@stories/avatar.jpg';
import { Meta, StoryObj } from '@storybook/react';

import { BlockQuote } from './BlockQuote';

export default {
  component: BlockQuote,
} satisfies Meta<typeof BlockQuote>;

export const Quote = {
  args: {
    role: 'test role',
    author: 'Author name',
    image: {
      url: Avatar,
      alt: 'Portrait',
    },
    quote:
      '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>' as Markup,
  },
} satisfies StoryObj<typeof BlockQuote>;

export const NoAvatarQuote = {
  args: {
    role: 'test role',
    author: 'Author name',
    quote:
      '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>' as Markup,
  },
} satisfies StoryObj<typeof BlockQuote>;
