import { addFilter } from 'wordpress__hooks';

addFilter(
  'blocks.registerBlockType',
  'custom/supportsHtml',
  (settings: { supports: { html: boolean } }) => {
    if (settings.supports) {
      settings.supports.html = drupalSettings.gutenberg.supportsHtml;
    }
    return settings;
  },
);
