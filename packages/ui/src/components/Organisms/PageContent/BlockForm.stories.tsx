import { Url } from '@custom/schema';
import { Meta, StoryObj } from '@storybook/react';

import cmsCss from '../../../iframe.css?inline';
import { BlockForm } from './BlockForm';

export default {
  component: BlockForm,
  parameters: {
    a11y: {
      // Disable because axe requires itself to be added inside the iframe.
      disable: true,
    },
  },
} satisfies Meta<typeof BlockForm>;

export const Idle = {
  args: {
    url: 'webforms/idle/index.html' as Url,
    cssStylesToInject: cmsCss,
  },
} satisfies StoryObj<typeof BlockForm>;

export const Error = {
  args: {
    url: 'webforms/error/index.html' as Url,
    cssStylesToInject: cmsCss,
  },
} satisfies StoryObj<typeof BlockForm>;

export const TermsOfServiceModal = {
  args: {
    url: 'webforms/terms-of-service-modal/index.html' as Url,
    cssStylesToInject: cmsCss,
  },
  parameters: {
    chromatic: {
      // Makes no sense to test on different viewports because the modal size
      // and position are hardcoded in the form snapshot.
      viewports: [1440],
    },
  },
} satisfies StoryObj<typeof BlockForm>;

export const TermsOfServiceSlideout = {
  args: {
    url: 'webforms/terms-of-service-slideout/index.html' as Url,
    cssStylesToInject: cmsCss,
  },
} satisfies StoryObj<typeof BlockForm>;
