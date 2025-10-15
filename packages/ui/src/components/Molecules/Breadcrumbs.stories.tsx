import { FrameQuery } from '@custom/schema';
import { Meta, StoryObj } from '@storybook/react';

import { Default as FrameStory } from '../Routes/Frame.stories';
import { BreadCrumbs } from './Breadcrumbs';

export default {
  component: BreadCrumbs,
  parameters: {
    layout: 'fullscreen',
    executors: {
      [FrameQuery]: FrameStory.parameters.executors[FrameQuery],
    },
  },
} satisfies Meta<typeof BreadCrumbs>;

export const Simple = {
  parameters: {
    location: new URL('local:/gatsby-turbo'),
  },
};

export const Truncated: StoryObj<typeof BreadCrumbs> = {
  parameters: {
    location: new URL('local:/gatsby-turbo-more-more-more'),
  },
};
