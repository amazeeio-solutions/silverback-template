import { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { Alert } from './Alert';

export default {
  parameters: {
    layout: 'fullscreen',
  },
  component: Alert,
} satisfies Meta<typeof Alert>;

const handleCloseButton = () => {
  console.log('Close button clicked');
};

export const Info: StoryObj<typeof Alert> = {
  render: () => {
    return (
      <>
        <Alert handleClose={handleCloseButton}>
          <p>
            This is an Info message, <a href="#">linked item</a>
          </p>
        </Alert>
        <Alert>
          <p>
            This is an Info message, <a href="#">linked item</a>
          </p>
        </Alert>
        <Alert withIcon={false}>
          <p>
            This is an Info message, <a href="#">linked item</a>
          </p>
        </Alert>
      </>
    );
  },
};

export const Warning: StoryObj<typeof Alert> = {
  render: () => {
    return (
      <>
        <Alert status={'warning'} handleClose={handleCloseButton}>
          <p>
            This is an warning message, <a href="#">linked item</a>
          </p>
        </Alert>
        <Alert status={'warning'}>
          <p>
            This is an warning message, <a href="#">linked item</a>
          </p>
        </Alert>
        <Alert status={'warning'} withIcon={false}>
          <p>
            This is an warning message, <a href="#">linked item</a>
          </p>
        </Alert>
      </>
    );
  },
};

export const Danger: StoryObj<typeof Alert> = {
  render: () => {
    return (
      <>
        <Alert status={'danger'} handleClose={handleCloseButton}>
          <p>
            This is an danger message, <a href="#">linked item</a>
          </p>
        </Alert>
        <Alert status={'danger'}>
          <p>
            This is an danger message, <a href="#">linked item</a>
          </p>
        </Alert>
        <Alert status={'danger'} withIcon={false}>
          <p>
            This is an danger message, <a href="#">linked item</a>
          </p>
        </Alert>
      </>
    );
  },
};

export const Success: StoryObj<typeof Alert> = {
  render: () => {
    return (
      <>
        <Alert status={'success'} handleClose={handleCloseButton}>
          <p>
            This is an success message, <a href="#">linked item</a>
          </p>
        </Alert>
        <Alert status={'success'}>
          <p>
            This is an success message, <a href="#">linked item</a>
          </p>
        </Alert>
        <Alert status={'success'} withIcon={false}>
          <p>
            This is an success message, <a href="#">linked item</a>
          </p>
        </Alert>
      </>
    );
  },
};
