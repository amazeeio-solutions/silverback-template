import type { Meta, StoryObj } from '@storybook/react';

import { DonationForm } from './DonationForm';

const meta = {
  title: 'Organisms/DonationForm',
  component: DonationForm,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    onSubmit: { action: 'submitted' },
  },
} satisfies Meta<typeof DonationForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    presetAmounts: [25, 50, 100, 250],
    ctaText: 'Donate Now',
  },
};

export const ProjectDonation: Story = {
  args: {
    presetAmounts: [50, 100, 250, 500],
    ctaText: 'Support This Project',
  },
};

export const BasicDonation: Story = {
  args: {
    presetAmounts: [25, 50, 100, 250],
    ctaText: 'Make Donation',
  },
};

export const FixedAmounts: Story = {
  args: {
    presetAmounts: [25, 50, 100, 250],
    ctaText: 'Donate Fixed Amount',
  },
};

export const HigherAmounts: Story = {
  args: {
    presetAmounts: [100, 250, 500, 1000],
    ctaText: 'Make Major Gift',
  },
};

export const Loading: Story = {
  args: {
    presetAmounts: [25, 50, 100, 250],
    ctaText: 'Donate Now',
    isLoading: true,
  },
};
