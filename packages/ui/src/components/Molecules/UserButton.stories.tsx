import { Meta, StoryObj } from '@storybook/react';

import { UserButton } from './UserButton';

export default {
  component: UserButton,
} satisfies Meta<typeof UserButton>;

// @todo add signed in and signed out states.
// @todo fix next-auth errors
export const UserButtonStory = {} satisfies StoryObj<typeof UserButton>;
