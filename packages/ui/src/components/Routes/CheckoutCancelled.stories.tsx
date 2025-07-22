import { FrameQuery } from '@custom/schema';
import type { Meta, StoryObj } from '@storybook/react';

import { Default as FrameStory } from '../Routes/Frame.stories';
import { CheckoutCancelled } from './CheckoutCancelled';

const meta = {
  title: 'Routes/CheckoutCancelled',
  component: CheckoutCancelled,
  parameters: {
    layout: 'fullscreen',
    executors: {
      [FrameQuery]: FrameStory.parameters.executors[FrameQuery],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CheckoutCancelled>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    nextjs: {
      router: {
        pathname: '/checkout/cancelled',
      },
    },
  },
};
