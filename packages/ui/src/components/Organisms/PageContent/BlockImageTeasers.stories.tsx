import { Url } from '@custom/schema';
import Landscape from '@stories/landscape.jpg';
import Portrait from '@stories/portrait.jpg';
import { Meta, StoryObj } from '@storybook/react';

import { BlockImageTeasers } from './BlockImageTeasers';

export default {
  component: BlockImageTeasers,
} satisfies Meta<typeof BlockImageTeasers>;

export const Default = {
  args: {
    teasers: [
      {
        title: 'Title',
        ctaText: 'Call to action',
        ctaUrl: '/test' as Url,
        image: {
          url: Landscape,
          alt: 'Alt text',
        },
      },
      {
        title: 'Title',
        ctaText: 'Call to action',
        ctaUrl: '/test' as Url,
        image: {
          url: Portrait,
          alt: 'Alt text',
        },
      },
    ],
  },
} satisfies StoryObj<typeof BlockImageTeasers>;
