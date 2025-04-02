import {
  CurrentUserQuery,
  OperationExecutorsProvider,
  OperationResult,
} from '@custom/schema';
import { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { UserProfile } from './UserProfile';

type CurrentUserExecutor = (
  id: typeof CurrentUserQuery,
) => Promise<OperationResult<typeof CurrentUserQuery>>;

export default {
  title: 'Components/Organisms/User Profile',
  render: (args) => {
    return (
      <OperationExecutorsProvider
        executors={[{ id: CurrentUserQuery, executor: args }]}
      >
        <UserProfile />
      </OperationExecutorsProvider>
    );
  },
} satisfies Meta<{ exec: CurrentUserExecutor }>;

type UserProfileStory = StoryObj<{ exec: CurrentUserExecutor }>;

export const Loading = {
  args: {
    exec: () => new Promise<OperationResult<typeof CurrentUserQuery>>(() => {}),
  },
} satisfies UserProfileStory;

export const Error = {
  args: {
    exec: () =>
      new Promise<OperationResult<typeof CurrentUserQuery>>(() => {
        throw 'Authentication error.';
      }),
  },
} satisfies UserProfileStory;

export const Authenticated = {
  args: {
    exec: async () => ({
      currentUser: {
        id: '1',
        name: 'Jane Doe',
        email: 'jane@example.com',
        memberFor: '1 year',
      },
    }),
  },
} satisfies UserProfileStory;
