import { InnerBlocks, InspectorControls } from 'wordpress__block-editor';
import { registerBlockType } from 'wordpress__blocks';
import { PanelBody, SelectControl } from 'wordpress__components';
import { dispatch } from 'wordpress__data';

import { DrupalMediaEntity } from '../utils/drupal-media';

registerBlockType<{
  mediaEntityIds?: [string];
  imagePosition: string;
}>('custom/image-with-text', {
  title: Drupal.t('Image with Text', {}, { context: 'gutenberg' }),
  icon: 'cover-image',
  category: 'layout',
  attributes: {
    mediaEntityIds: {
      type: 'array',
    },
    imagePosition: {
      type: 'string',
      default: 'left',
    },
  },
  edit: (props) => {
    const { setAttributes } = props;
    return (
      <>
        <InspectorControls>
          <PanelBody
            title={Drupal.t('Image position', {}, { context: 'gutenberg' })}
          >
            <SelectControl
              value={props.attributes.imagePosition}
              options={[
                {
                  label: Drupal.t('Left', {}, { context: 'gutenberg' }),
                  value: 'left',
                },
                {
                  label: Drupal.t('Right', {}, { context: 'gutenberg' }),
                  value: 'right',
                },
              ]}
              onChange={(imagePosition: string) => {
                setAttributes({
                  imagePosition,
                });
              }}
            />
          </PanelBody>
        </InspectorControls>
        <div className={'container-wrapper !border-stone-500'}>
          <div className={'container-label'}>
            {Drupal.t('Image with Text', {}, { context: 'gutenberg' })}
          </div>
          <DrupalMediaEntity
            classname={'w-full'}
            attributes={{
              ...props.attributes,
              lockViewMode: true,
              viewMode: 'gutenberg_header',
              allowedTypes: ['image'],
            }}
            setAttributes={props.setAttributes}
            isMediaLibraryEnabled={true}
            onError={(error) => {
              error = typeof error === 'string' ? error : error[2];
              dispatch('core/notices').createWarningNotice(error);
            }}
          />
          <InnerBlocks
            templateLock={false}
            allowedBlocks={[
              // Only markup blocks.
              'core/paragraph',
              'core/list',
              'core/table',
              'core/quote',
              'custom/heading',
            ]}
            template={[['core/paragraph']]}
          />
        </div>
      </>
    );
  },
  save: () => <InnerBlocks.Content />,
});
