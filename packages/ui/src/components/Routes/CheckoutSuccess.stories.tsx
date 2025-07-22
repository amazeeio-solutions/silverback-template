import { FrameQuery } from '@custom/schema';
import type { Meta, StoryObj } from '@storybook/react';

import { Default as FrameStory } from '../Routes/Frame.stories';
import { CheckoutSuccess } from './CheckoutSuccess';

const meta = {
  title: 'Routes/CheckoutSuccess',
  component: CheckoutSuccess,
  parameters: {
    layout: 'fullscreen',
    executors: {
      [FrameQuery]: FrameStory.parameters.executors[FrameQuery],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CheckoutSuccess>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    nextjs: {
      router: {
        pathname: '/checkout/success',
        query: {
          orderNumber: 'ORD-2024-001234',
        },
      },
    },
  },
};

export const WithoutOrderNumber: Story = {
  parameters: {
    nextjs: {
      router: {
        pathname: '/checkout/success',
        query: {},
      },
    },
  },
};

export const LongOrderNumber: Story = {
  parameters: {
    nextjs: {
      router: {
        pathname: '/checkout/success',
        query: {
          orderNumber: 'ORD-2024-VERY-LONG-ORDER-NUMBER-123456789',
        },
      },
    },
  },
};
