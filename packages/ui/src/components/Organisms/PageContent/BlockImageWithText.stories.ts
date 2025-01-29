import { ImagePosition, Markup } from '@custom/schema';
import Landscape from '@stories/landscape.jpg';
import { Meta, StoryObj } from '@storybook/react';

import { BlockImageWithText } from './BlockImageWithText';

export default {
  component: BlockImageWithText,
} satisfies Meta<typeof BlockImageWithText>;

export const ImageRight = {
  args: {
    image: {
      url: Landscape,
      alt: 'Landscape',
    },
    imagePosition: ImagePosition.Right,
    textContent: {
      markup: `
      <h2>Image Right</h2>
      <ul>
      <li> short item.</li>
      <li>Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo.</li>
        <li> Ac tincidunt sapien vehicula erat auctor pellentesque rhoncus. Et magna sit morbi lobortis.</li>
      </ul>
    ` as Markup,
    },
  },
} satisfies StoryObj<typeof BlockImageWithText>;

export const ImageLeft = {
  args: {
    image: {
      url: Landscape,
      alt: 'Landscape',
    },
    imagePosition: ImagePosition.Left,
    textContent: {
      markup: `
      <h2>Image Left</h2>
      <ul ">
      <li> short item.</li>
      <li>Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo.</li>
        <li> Ac tincidunt sapien vehicula erat auctor pellentesque rhoncus. Et magna sit morbi lobortis.</li>
      </ul>
    ` as Markup,
    },
  },
} satisfies StoryObj<typeof BlockImageWithText>;

export const ArrowList = {
  args: {
    image: {
      url: Landscape,
      alt: 'Landscape',
    },
    textContent: {
      markup: `
      <h2>Arrow List</h2>
      <ul class="list-style--arrows">
      <li> short item.</li>
      <li>Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo.</li>
        <li> Ac tincidunt sapien vehicula erat auctor pellentesque rhoncus. Et magna sit morbi lobortis.</li>
      </ul>
    ` as Markup,
    },
  },
} satisfies StoryObj<typeof BlockImageWithText>;

export const QuestionMarkList = {
  args: {
    image: {
      url: Landscape,
      alt: 'Landscape',
    },
    textContent: {
      markup: `
      <h2>Question Mark List</h2>
      <ul class="list-style--question-marks">
      <li>short item.</li>
      <li> Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo.</li>
        <li>Ac tincidunt sapien vehicula erat auctor pellentesque rhoncus. Et magna sit morbi lobortis.</li>
      </ul>
    ` as Markup,
    },
  },
} satisfies StoryObj<typeof BlockImageWithText>;

export const CheckMarkList = {
  args: {
    image: {
      url: Landscape,
      alt: 'Landscape',
    },
    textContent: {
      markup: `
      <h2>Check Mark List</h2>
      <ul class="list-style--checkmarks">
        <li>short item.</li>
        <li>2 liners item Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo.</li>
        <li>Ac tincidunt sapien vehicula erat auctor pellentesque rhoncus. Et magna sit morbi lobortis.</li>
      </ul>
    ` as Markup,
    },
  },
} satisfies StoryObj<typeof BlockImageWithText>;
