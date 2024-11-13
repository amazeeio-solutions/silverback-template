import { registerBlockType } from 'wordpress__blocks';

registerBlockType<{}>(`custom/horizontal-separator`, {
  title: Drupal.t('Horizontal separator', {}, { context: 'gutenberg' }),
  icon: 'minus',
  category: 'text',
  attributes: {},
  edit: () => {
    return <hr />;
  },
  save: () => {
    return null;
  },
});
