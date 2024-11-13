import React, { Fragment } from 'react';
import { InspectorControls, RichText } from 'wordpress__block-editor';
import { registerBlockType } from 'wordpress__blocks';
import { PanelBody } from 'wordpress__components';
import { dispatch } from 'wordpress__data';

import { DrupalMediaEntity } from '../utils/drupal-media';

registerBlockType<{
  heading: string;
  description: string;
  mediaEntityIds?: [string];
  url: string;
}>('custom/demo-block', {
  title: Drupal.t('Demo Block', {}, { context: 'gutenberg' }),
  icon: 'text',
  category: 'common',
  attributes: {
    heading: {
      type: 'string',
      default: '',
    },
    description: {
      type: 'string',
      default: '',
    },
    mediaEntityIds: {
      type: 'array',
    },
    url: {
      type: 'string',
      default: '',
    },
  },

  edit: (props) => {
    const { attributes, setAttributes } = props;

    // Set default values this way so that values get saved in the block's attributes.
    //props.setAttributes({
    //  isQuote:
    //    props.attributes.isQuote === undefined
    //      ? false
    //      : props.attributes.isQuote,
    //});

    return (
      <Fragment>
        <InspectorControls>
          <PanelBody
            title={Drupal.t('Block settings', {}, { context: 'gutenberg' })}
          >
            <p>Block settings</p>
          </PanelBody>
        </InspectorControls>
        <div className={'container-wrapper !border-stone-500'}>
          <div className={'container-label'}>
            {Drupal.t('Demo Block', {}, { context: 'gutenberg' })}
          </div>
          <div className="custom-block-demo-block">
            <RichText
              identifier="heading"
              tagName="p"
              value={attributes.heading}
              allowedFormats={[]}
              disableLineBreaks={true}
              placeholder={Drupal.t('Heading', {}, { context: 'gutenberg' })}
              keepPlaceholderOnFocus={true}
              onChange={(newValue) => {
                setAttributes({ heading: newValue });
              }}
            />
            <RichText
              identifier="description"
              tagName="p"
              value={attributes.description}
              allowedFormats={[]}
              disableLineBreaks={true}
              placeholder={Drupal.t(
                'Description',
                {},
                { context: 'gutenberg' },
              )}
              keepPlaceholderOnFocus={true}
              onChange={(newValue) => {
                setAttributes({ description: newValue });
              }}
            />
            <DrupalMediaEntity
              classname={'w-full'}
              attributes={{
                ...props.attributes,
                lockViewMode: true,
                allowedTypes: ['image'],
              }}
              setAttributes={props.setAttributes}
              isMediaLibraryEnabled={true}
              onError={(error) => {
                error = typeof error === 'string' ? error : error[2];
                dispatch('core/notices').createWarningNotice(error);
              }}
            />
            <RichText
              identifier="url"
              tagName="p"
              value={attributes.url}
              allowedFormats={[]}
              disableLineBreaks={true}
              placeholder={Drupal.t('Url', {}, { context: 'gutenberg' })}
              keepPlaceholderOnFocus={true}
              onChange={(newValue) => {
                setAttributes({ url: newValue });
              }}
            />
          </div>
        </div>
      </Fragment>
    );
  },

  save: () => {
    return null;
    // or uncomment this if you import and use InnerBlocks from wordpress__block-editor
    // return <InnerBlocks.Content />;
  },
});
