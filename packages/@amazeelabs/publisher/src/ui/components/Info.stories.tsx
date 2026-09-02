import { Meta, StoryObj } from '@storybook/react';
import { expect, screen, userEvent, waitFor, within } from '@storybook/test';

import Info from './Info';

export default {
  component: Info,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta;

const HistoryItems = [
  {
    id: 73,
    type: 'incremental',
    startedAt: 1330211842010,
    finishedAt: 1330297200000,
    success: true,
  },
  {
    id: 72,
    type: 'initial',
    startedAt: 1330220801000,
    finishedAt: 1330297200000,
    success: false,
  },
  {
    id: 13,
    type: 'incremental',
    startedAt: 1330230840000,
    finishedAt: 1330297200000,
    success: true,
  },
  {
    id: 23,
    type: 'incremental',
    startedAt: 1330210830000,
    finishedAt: 1330297200000,
    success: true,
  },
  {
    id: 74,
    type: 'incremental',
    startedAt: 1330200870000,
    finishedAt: 1330297200000,
    success: false,
  },
];

export const ExampleInfo: StoryObj<typeof Info> = {
  args: {
    historyItems: HistoryItems,
    isStorybook: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const logsToggle = canvas.getByRole('button', { name: 'Toggle logs' });

    await expect(canvas.getByText('Logs')).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('.simple-log'),
    ).toBeInTheDocument();

    await userEvent.click(logsToggle);
    await waitFor(() =>
      expect(
        canvasElement.querySelector('.simple-log'),
      ).not.toBeInTheDocument(),
    );

    await userEvent.click(logsToggle);
    await waitFor(() =>
      expect(canvasElement.querySelector('.simple-log')).toBeInTheDocument(),
    );

    await userEvent.click(canvas.getByRole('button', { name: 'Clean' }));
    // The confirmation dialog is rendered in a portal outside of the canvas.
    const confirmation = await screen.findByText(
      /Please confirm that you definitely want to clean the build/,
    );
    await userEvent.click(screen.getByRole('button', { name: 'No, go back!' }));
    await waitFor(() => expect(confirmation).not.toBeInTheDocument());

    // Expanding a build history row is not covered here: it fetches
    // /___status/history/:id, which has no backend in a static storybook.
    await expect(canvas.getByText('73')).toBeInTheDocument();
  },
};
