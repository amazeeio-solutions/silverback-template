import {
  __experimentalLinkControl as LinkControl,
  InnerBlocks,
  InspectorControls,
  RichText,
} from 'wordpress__block-editor';
import { registerBlockType } from 'wordpress__blocks';
import { PanelBody } from 'wordpress__components';
import { dispatch } from 'wordpress__data';

import { DrupalMediaEntity } from '../utils/drupal-media';

const { setPlainTextAttribute } = silverbackGutenbergUtils;

registerBlockType<{
  mediaEntityIds?: [string];
  title: string;
  ctaUrl?: string;
  ctaText: string;
}>('custom/image-teaser', {
  title: Drupal.t('Image Teaser', {}, { context: 'gutenberg' }),
  parent: ['custom/image-teasers'],
  icon: 'cover-image',
  category: 'layout',
  attributes: {
    mediaEntityIds: {
      type: 'array',
    },
    title: {
      type: 'string',
      default: '',
    },
    ctaUrl: {
      type: 'string',
    },
    ctaText: {
      type: 'string',
      default: '',
    },
  },
  edit: (props) => {
    return (
      <>
        <InspectorControls>
          <PanelBody title={Drupal.t('CTA Link', {}, { context: 'gutenberg' })}>
            <LinkControl
              placeholder={Drupal.t('Link', {}, { context: 'gutenberg' })}
              value={{
                url: props.attributes.ctaUrl,
              }}
              settings={{}}
              onChange={(link: { url: string; opensInNewTab: boolean }) => {
                props.setAttributes({
                  ctaUrl: link.url,
                });
              }}
            />
          </PanelBody>
        </InspectorControls>
        <div>
          <div>
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
          </div>

          <div>
            <div>
              <RichText
                className={'mt-3 text-2xl font-bold'}
                identifier="title"
                tagName="div"
                value={props.attributes.title}
                allowedFormats={[]}
                disableLineBreaks={true}
                placeholder={Drupal.t('Title', {}, { context: 'gutenberg' })}
                keepPlaceholderOnFocus={true}
                onChange={(title) => {
                  setPlainTextAttribute(props, 'title', title);
                }}
              />
            </div>
            <div>
              <RichText
                identifier="ctaText"
                tagName="div"
                multiline={false}
                value={props.attributes.ctaText}
                allowedFormats={[]}
                disableLineBreaks={true}
                placeholder={Drupal.t('CTA text', {}, { context: 'gutenberg' })}
                keepPlaceholderOnFocus={true}
                style={{
                  cursor: 'text',
                }}
                onChange={(ctaText) => {
                  setPlainTextAttribute(props, 'ctaText', ctaText);
                }}
              />
            </div>
          </div>
        </div>
      </>
    );
  },
  save: () => <InnerBlocks.Content />,
});
