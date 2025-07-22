import { FrameQuery } from '@custom/schema';
import type { Meta, StoryObj } from '@storybook/react';

import { Default as FrameStory } from '../Routes/Frame.stories';
import { CheckoutFailed } from './CheckoutFailed';

const meta = {
  title: 'Routes/CheckoutFailed',
  component: CheckoutFailed,
  parameters: {
    layout: 'fullscreen',
    executors: {
      [FrameQuery]: FrameStory.parameters.executors[FrameQuery],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CheckoutFailed>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    nextjs: {
      router: {
        pathname: '/checkout/failed',
      },
    },
  },
};
