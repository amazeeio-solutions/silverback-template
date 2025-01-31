import Portrait from '@stories/portrait.jpg?as=metadata';
import { Meta, StoryObj } from '@storybook/react';

import { image } from '../../../helpers/image';
import { BlockPersonTeaser } from './BlockPersonTeaser';

export default {
  component: BlockPersonTeaser,
} satisfies Meta<typeof BlockPersonTeaser>;

export const Default = {
  args: {
    name: 'John Doe',
    birthdate: '1990-01-01',
    image: {
      source: image(Portrait),
      alt: 'John Doe portrait',
    },
  },
} satisfies StoryObj<typeof BlockPersonTeaser>;

export const WithoutImage = {
  args: {
    name: 'Jane Smith',
    birthdate: '1985-06-15',
  },
} satisfies StoryObj<typeof BlockPersonTeaser>;
