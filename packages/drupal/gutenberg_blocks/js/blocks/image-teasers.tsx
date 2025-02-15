import { InnerBlocks } from 'wordpress__block-editor';
import { registerBlockType } from 'wordpress__blocks';

registerBlockType<{}>('custom/image-teasers', {
  title: Drupal.t('Image Teasers', {}, { context: 'gutenberg' }),
  icon: 'format-image',
  category: 'layout',
  attributes: {},
  edit: () => {
    return (
      <div className={'container-wrapper !border-stone-500'}>
        <div className={'container-label'}>
          {Drupal.t('Image Teasers', {}, { context: 'gutenberg' })}
        </div>
        <InnerBlocks
          templateLock={false}
          allowedBlocks={['custom/image-teaser']}
          template={[['custom/image-teaser']]}
        />
      </div>
    );
  },
  save: () => <InnerBlocks.Content />,
});
