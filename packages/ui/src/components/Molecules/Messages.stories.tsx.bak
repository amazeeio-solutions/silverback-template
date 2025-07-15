import { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { Messages as Component } from './Messages';

export default {
  parameters: {
    layout: 'fullscreen',
  },
  component: Component,
} satisfies Meta<typeof Component>;

export const MessagesList: StoryObj<typeof Component> = {
  parameters: {
    location: new URL('local:/gatsby-turbo'),
  },
  args: {
    messages: [
      '<p>This is an Info message, <a href=#>linked item</a></p><ul><li>Fribourgeoise</li><li>Moitié-Moitié</li></ul>',
      '<p>This is a Warning message, <a href=#>linked item</a></p>',
      '<p>This is a Danger message, <a href=#>linked item</a></p>',
      '<p>This is a Success message, <a href=#>linked item</a></p>',
    ],
    messageComponents: [
      <div key={'test'}>
        {'This page is not available in the requested language.'}{' '}
        <a
          href="#"
          onClick={() => {
            window.history.back();
          }}
        >
          {'Go back'}
        </a>
      </div>,
    ],
  },
};
