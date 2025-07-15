import { Meta, StoryObj } from '@storybook/react';

import { Price } from './Price';

export default {
  component: Price,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    amount: {
      control: 'number',
    },
  },
} satisfies Meta<typeof Price>;

export const BasicPrice = {
  args: {
    amount: 29.99,
    className: 'text-lg font-semibold',
  },
} satisfies StoryObj<typeof Price>;

export const LargePrice = {
  args: {
    amount: 149.9,
    className: 'text-2xl font-bold',
  },
} satisfies StoryObj<typeof Price>;

export const SmallPrice = {
  args: {
    amount: 9.9,
    className: 'text-sm',
  },
} satisfies StoryObj<typeof Price>;

export const HighValue = {
  args: {
    amount: 1299.0,
    className: 'text-2xl font-bold text-primary',
  },
} satisfies StoryObj<typeof Price>;

export const LowValue = {
  args: {
    amount: 4.5,
    className: 'text-sm',
  },
} satisfies StoryObj<typeof Price>;

export const ZeroPrice = {
  args: {
    amount: 0,
    className: 'text-lg font-semibold',
  },
} satisfies StoryObj<typeof Price>;
