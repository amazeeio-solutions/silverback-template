import { Meta, StoryObj } from '@storybook/react';

import { SearchForm as Component } from './SearchForm';

const termOptions = [
  { termId: '1', label: 'Block', depth: 0, locale: 'en' as const },
  { termId: '2', label: '- List', depth: 0, locale: 'en' as const },
  { termId: '3', label: 'Demo', depth: 0, locale: 'en' as const },
  { termId: '4', label: 'Page', depth: 0, locale: 'en' as const },
];

export default {
  component: Component,
  args: {
    termOptions: termOptions,
  },
} satisfies Meta<typeof Component>;

export const Empty = {} satisfies StoryObj<typeof Component>;
export const Prefilled: StoryObj<typeof Component> = {
  parameters: {
    location: new URL('local:/?keyword=Foobar&terms=Demo'),
  },
};
