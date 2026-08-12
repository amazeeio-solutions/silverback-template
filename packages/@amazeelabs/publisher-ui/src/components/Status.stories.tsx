import { ApplicationState } from '@amazeelabs/publisher-shared';
import { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';

import Status from './Status';

export default {
  component: Status,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta;

export const Init: StoryObj<typeof Status> = {
  args: {
    status: ApplicationState.Starting,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Starting...')).toBeInTheDocument();
    await expect(canvasElement.querySelector('#L9')).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('.animate-bounce'),
    ).toBeInTheDocument();
  },
};
export const Error: StoryObj<typeof Status> = {
  args: {
    status: ApplicationState.Error,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Error!')).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('.cross-circle'),
    ).toBeInTheDocument();
    await expect(canvasElement.querySelector('#L9')).not.toBeInTheDocument();
  },
};
export const Ready: StoryObj<typeof Status> = {
  args: {
    status: ApplicationState.Ready,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Ready!')).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('.tick-circle'),
    ).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('.animate-bounce'),
    ).not.toBeInTheDocument();
  },
};
