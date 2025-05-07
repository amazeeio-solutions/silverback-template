import './customisations';
import './preview';
import './blocks/hero';
import './blocks/content';
import './blocks/heading';
import './blocks/form';
import './blocks/image-teaser';
import './blocks/image-teasers';
import './blocks/image-with-text';
import './filters/html-edit';
import './filters/list';
import './blocks/cta';
import './blocks/quote';
import './blocks/conditional';
import './blocks/horizontal-separator';
import './blocks/accordion';
import './blocks/accordion-item-text';
import './blocks/info-grid';
import './blocks/info-grid-item';
import './blocks/teaser-list';
import './blocks/teaser-item';

import { ComponentType } from 'react';

/* eslint-disable */

declare global {
  interface Window {
    DrupalGutenberg: any;
  }

  const Drupal: {
    behaviors: any;
    t: (s: string, t?: object, c?: object) => string;
  };

  const DrupalGutenberg: {
    Components: {
      DrupalMediaEntity: any;
    };
  };

  const silverbackGutenbergUtils: {
    sanitizeText: (text: string) => string;
    setPlainTextAttribute: (props: any, name: string, text: string) => void;
  };

  const drupalSettings: {
    gutenberg: any;
    preview: any;
    supportsHtml: boolean;
    path: {
      baseUrl: string;
      pathPrefix: string;
    };
    customGutenbergBlocks: {
      forms: Array<{
        id: string;
        url: string;
        label: string;
      }>;
    };
  };

  // TODO improve typing - take from WP Gutenberg
  const wp: {
    richText: { unregisterFormatType: (block: string) => void };
    blocks: {
      registerBlockType: any;
      InnerBlocks: any;
      getBlockType: (type: string) => any;
      getBlockTypes: () => any[];
      unregisterBlockType: (block: string) => void;
    };
  };

  const jQuery: any;
  const once: any;
}

// Fix Gutenberg types.
declare module '@wordpress/block-editor' {
  namespace RichText {
    interface Props<T extends keyof HTMLElementTagNameMap> {
      disableLineBreaks?: boolean;
    }
  }
  const __experimentalLinkControl: ComponentType<any>;
}
