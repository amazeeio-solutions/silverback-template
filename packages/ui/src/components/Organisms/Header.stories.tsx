import { FrameQuery, Locale, Url } from '@custom/schema';
import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/test';

import { Header } from './Header';

export default {
  component: Header,
  parameters: {
    layout: 'fullscreen',
  },
  excludeStories: /^Fixture/,
} satisfies Meta<typeof Header>;

export const Idle = {
  parameters: {
    executors: {
      [FrameQuery]: {
        mainNavigation: [
          {
            locale: Locale.En,
            items: [
              {
                id: '1',
                title: 'Home',
                target: '/' as Url,
              },
              {
                id: '2',
                title: 'Products',
                target: '/products' as Url,
              },
              {
                id: '3',
                title: 'About us',
                target: '/about' as Url,
              },
              {
                id: '4',
                title: 'Blog',
                target: '/blog' as Url,
              },
              {
                id: '5',
                title: 'Drupal',
                target: '/drupal' as Url,
                parent: '2',
              },
              {
                id: '6',
                title: 'Gatsby',
                target: '/gatsby' as Url,
                parent: '2',
              },
              {
                id: '7',
                title: 'Gatsby Turbo',
                target: '/gatsby-turbo' as Url,
                parent: '6',
              },
              {
                id: '8',
                title: 'Super Gatsby Turbo',
                target: '/gatsby-turbo' as Url,
                parent: '7',
              },
              {
                id: '9',
                title: 'Drupal Turbo This is a little extra long',
                target: '/gatsby-turbo-more-more' as Url,
                parent: '8',
              },
              {
                id: '10',
                title:
                  'Drupal Turbo This is a little extra long breadcrumb title',
                target: '/gatsby-turbo-more-more-more' as Url,
                parent: '9',
              },
            ],
          },
        ],
        metaNavigation: [
          {
            locale: Locale.En,
            items: [
              {
                id: '1',
                title: 'Imprint',
                target: '/imprint' as Url,
              },
              {
                id: '2',
                title: 'Privacy',
                target: '/privacy' as Url,
              },
            ],
          },
        ],
      },
    },
  },
} satisfies StoryObj<FrameQuery>;

export const Expanded = {
  ...Idle,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const navigation = within(
      await canvas.findByRole('navigation', { name: 'Global' }),
    );
    const mobileMenuButton = navigation.queryByRole('button', {
      name: 'Open main navigation',
    });
    if (mobileMenuButton) {
      await userEvent.click(mobileMenuButton, {
        delay: 100, // The mobile navigation does not appear randomly without this delay.
      });
      const dialog = within(
        await within(canvasElement.parentElement!).findByRole('dialog'),
      );
      await userEvent.click(
        await dialog.findByRole('button', { name: 'Products' }),
      );
      await dialog.findByRole('link', { name: 'Drupal' });
    } else {
      await userEvent.click(
        await navigation.findByRole('button', { name: 'Products' }),
      );
      userEvent.click(
        await navigation.findByRole('button', { name: 'Gatsby' }),
      );
      await navigation.findByRole('link', { name: 'Gatsby Turbo' });
    }
  },
} satisfies StoryObj<FrameQuery>;
