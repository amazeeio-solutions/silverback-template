import { FrameQuery, Locale, Url } from '@custom/schema';
import { Meta, StoryObj } from '@storybook/react';

import { Footer as Component } from './Footer';

export default {
  component: Component,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Component>;

export const Footer = {
  parameters: {
    executors: {
      [FrameQuery]: {
        footerNavigation: [
          {
            locale: Locale.En,
            items: [
              {
                id: '1',
                title: 'About',
                target: '/about' as Url,
              },
              {
                id: '2',
                title: 'Blog',
                target: '/blog' as Url,
              },
              {
                id: '3',
                title: 'Jobs',
                target: '/jobs' as Url,
              },
              {
                id: '4',
                title: 'Press',
                target: '/press' as Url,
              },
              {
                id: '5',
                title: 'Accessibility',
                target: '/accessibility' as Url,
              },
              {
                id: '6',
                title: 'Partners',
                target: '/partners' as Url,
              },
              {
                id: '7',
                title: 'Drupal',
                target: '/drupal' as Url,
                parent: '0',
              },
              {
                id: '8',
                title: 'Gatsby',
                target: '/gatsby' as Url,
                parent: '0',
              },
            ].map((item, index) => ({
              ...item,
              id: index.toString(),
              locale: 'en' as Locale,
            })),
          },
        ],
      },
    },
  },
} satisfies StoryObj<FrameQuery>;
