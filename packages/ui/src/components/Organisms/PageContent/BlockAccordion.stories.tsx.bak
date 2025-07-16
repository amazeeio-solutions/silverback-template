import { Markup } from '@custom/schema';
import { Meta, StoryObj } from '@storybook/react';

import { BlockAccordion } from './BlockAccordion';

export default {
  component: BlockAccordion,
} satisfies Meta<typeof BlockAccordion>;

export const AccordionItemText = {
  args: {
    items: [
      {
        title: 'Cheese Fondue',
        icon: 'arrow',
        textContent: {
          markup: `
          <p>The earliest known recipe for the modern form of cheese fondue comes from a 1699 book published in Zürich, under the name "Käss mit Wein zu kochen" 'to cook cheese with wine'.</p>
          <p>It calls for grated or cut-up cheese to be melted with wine, and for bread to be dipped in it. However, the name "cheese fondue", until the late 19th century, referred to a dish composed of eggs and cheese, as in la Chapelle's 1735 Fonduë de Fromage, aux Truffes Fraiches; it was something between scrambled eggs with cheese and a cheese soufflé. Brillat-Savarin wrote in 1834 that it is "nothing other than scrambled eggs with cheese". Variations included cream ("à la genevoise") and truffles ("à la piémontaise") in addition to eggs, as well as what is now called "raclette" ("fondue valaisanne").</p>
          <ul>
          <li>Fribourgeoise</li>
          <li>Moitié-Moitié</li>
          </ul>
        ` as Markup,
        },
      },
      {
        title: 'Rösti',
        icon: 'questionmark',
        textContent: {
          markup: `
          <p>Rösti is a kind of fried potato cake served as a main course or side dish.</p>
          <p>As a main dish, rösti is usually accompanied with cheese, onions and cold meat or eggs. This dish, originally from Zürich, was first simply made by frying grated raw potatoes in a pan. It has then spread towards Bern where it is made with boiled potatoes instead. This is where it took the name Rösti. There are many variants in Switzerland and outside the borders. This culinary specialty gives its name to the röstigraben, which designates the cultural differences between the German- and French-speaking parts of the country.</p>
        ` as Markup,
        },
      },
      {
        title: 'Älplermagronen',
        icon: 'checkmark',
        textContent: {
          markup: `
          <p>Älplermagronen are now regarded as a traditional dish of the Swiss Alps and a classic of Swiss comfort foods. According to a popular theory, pasta became widespread in northern Switzerland in the late 19th century, when the Gotthard Tunnel was built, partly by Italian workers who brought dry pasta with them.</p>
        ` as Markup,
        },
      },
      {
        title:
          'Meringue with double cream, a dessert made of whipped egg whites, traditionally accompanied by double Gruyère cream',
        icon: '',
        textContent: {
          markup: `
          <p>The Oxford English Dictionary states that the French word is of unknown origin. The name meringue for this confection first appeared in print in François Massialot's cookbook of 1692.</p>
        ` as Markup,
        },
      },
    ],
  },
} satisfies StoryObj<typeof BlockAccordion>;
