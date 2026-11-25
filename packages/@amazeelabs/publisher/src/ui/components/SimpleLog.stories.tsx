import { Meta, StoryObj } from '@storybook/react';
import { expect, waitFor, within } from '@storybook/test';
import React from 'react';

import SimpleLog from './SimpleLog';

export default {
  component: SimpleLog,
  decorators: [
    (Story) => (
      <div style={{ height: '160px' }}>
        <Story />
      </div>
    ),
  ],
} as Meta;

// The demo mode appends one message every 500ms, so the assertions below need
// timeouts beyond the testing library default.
const messageInterval = 500;

export const Default: StoryObj<typeof SimpleLog> = {
  args: {
    url: '__storybook__',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvasElement.querySelector('.simple-log'),
    ).toBeEmptyDOMElement();

    await canvas.findByText('Message 1', undefined, {
      timeout: messageInterval * 3,
    });
    await canvas.findByText('Message 2', undefined, {
      timeout: messageInterval * 3,
    });

    await waitFor(
      async () => {
        const link = canvasElement.querySelector('a');
        await expect(link).toBeInTheDocument();
        await expect(link).toHaveAttribute('href', 'https://example.com');
        await expect(link).toHaveAttribute('target', '_blank');
      },
      { timeout: messageInterval * 8 },
    );
  },
};
