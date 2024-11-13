import clsx from 'clsx';
import {
  __experimentalLinkControl as LinkControl,
  InspectorControls,
  RichText,
} from 'wordpress__block-editor';
import { registerBlockType } from 'wordpress__blocks';
import { PanelBody, SelectControl, ToggleControl } from 'wordpress__components';

const { setPlainTextAttribute } = silverbackGutenbergUtils;

const ArrowRightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 16 15"
    fill="none"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M9.83401 4.23435C9.98403 4.08437 10.1875 4.00012 10.3996 4.00012C10.6117 4.00012 10.8152 4.08437 10.9652 4.23435L14.1652 7.43435C14.3152 7.58437 14.3994 7.78782 14.3994 7.99995C14.3994 8.21208 14.3152 8.41553 14.1652 8.56555L10.9652 11.7656C10.8143 11.9113 10.6122 11.9919 10.4025 11.9901C10.1927 11.9883 9.99208 11.9041 9.84375 11.7558C9.69543 11.6075 9.61129 11.4068 9.60947 11.1971C9.60765 10.9873 9.68828 10.7852 9.83401 10.6344L11.6684 8.79995H2.39961C2.18744 8.79995 1.98395 8.71567 1.83392 8.56564C1.68389 8.41561 1.59961 8.21212 1.59961 7.99995C1.59961 7.78778 1.68389 7.5843 1.83392 7.43427C1.98395 7.28424 2.18744 7.19995 2.39961 7.19995H11.6684L9.83401 5.36555C9.68403 5.21553 9.59978 5.01208 9.59978 4.79995C9.59978 4.58782 9.68403 4.38437 9.83401 4.23435Z"
      className=" fill-blue-600 transition-all duration-200 ease-in-out group-hover:fill-white"
    />
  </svg>
);

registerBlockType<{
  url?: string;
  text: string;
  'data-id'?: string;
  'data-entity-type'?: string;
  openInNewTab: boolean;
  icon: string;
  iconPosition: string;
}>('custom/cta', {
  title: 'CTA',
  icon: 'admin-links',
  category: 'common',
  attributes: {
    url: {
      type: 'string',
    },
    text: {
      type: 'string',
      default: '',
    },
    // To have an easier integration with entity usage, we also retrieve and
    // store the uuid (data-id) and the entity type of internal links.
    'data-id': {
      type: 'string',
    },
    'data-entity-type': {
      type: 'string',
    },
    openInNewTab: {
      type: 'boolean',
      default: false,
    },
    icon: {
      type: 'string',
      default: 'NONE',
    },
    iconPosition: {
      type: 'string',
      default: 'AFTER',
    },
  },
  edit: (props) => {
    return (
      <div>
        <a
          className={clsx(
            {
              'flex-row-reverse': props.attributes.iconPosition === 'BEFORE',
            },
            'group flex w-fit flex-row items-center gap-2 rounded-lg border border-blue-600 px-3 py-2 text-center text-xs font-medium  text-blue-600 no-underline transition-all duration-200 ease-in-out hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-4 focus:ring-blue-300',
          )}
        >
          <RichText
            identifier="text"
            tagName="span"
            value={props.attributes.text}
            allowedFormats={[]}
            disableLineBreaks={true}
            placeholder={Drupal.t('Link text', {}, { context: 'gutenberg' })}
            keepPlaceholderOnFocus={true}
            style={{
              cursor: 'text',
            }}
            onChange={(text) => {
              setPlainTextAttribute(props, 'text', text);
            }}
          />
          {typeof props.attributes.icon !== 'undefined' &&
            props.attributes.icon === 'ARROW' && <ArrowRightIcon />}
        </a>
        <InspectorControls>
          <PanelBody title={Drupal.t('CTA Link', {}, { context: 'gutenberg' })}>
            <LinkControl
              value={{
                url: props.attributes.url,
                openInNewTab: props.attributes.openInNewTab,
              }}
              settings={{}}
              // If you want to use a specific linkit profile for the suggestions,
              // then you can do that by using the 'suggestionsQuery' property, like
              // the one bellow, and change the 'subtype' property to the machine
              // name of the linkit profile. By default, the 'gutenberg' profile
              // is used. Of course, in this case, if the linkit profile can search
              // through multiple entity types, then you'll have to set the value
              // for 'data-entity-type' in the onChange() handler by yourself.

              //suggestionsQuery={{
              //  subtype: 'gutenberg',
              //}}

              onChange={(link: { url: string; id: string; type: string }) => {
                props.setAttributes({
                  url: link.url,
                  'data-id': link.id,
                  'data-entity-type':
                    // At the moment, the silverback_gutenberg link autocomplete
                    // controller does not return the machine name of the entity
                    // type. Instead, it returns the human readable, translated,
                    // entity type label. We should refactor the LinkAutocomplete
                    // controller to return the machine name of the entity type, and
                    // then we can set the data-entity-type value more accurate.
                    // Right now, we just make a "guess" based on the the human
                    // readable label for English and German.
                    // TODO - this depends on each language, find new solution
                    link.type.startsWith('Media') ||
                    link.type.startsWith('Medien')
                      ? 'media'
                      : link.type !== 'URL'
                        ? 'node'
                        : '',
                });
              }}
            />
            <ToggleControl
              label={Drupal.t('Open in new tab', {}, { context: 'gutenberg' })}
              help={
                props.attributes.openInNewTab
                  ? Drupal.t(
                      'Opens in a new tab.',
                      {},
                      { context: 'gutenberg' },
                    )
                  : Drupal.t(
                      'Opens in the same tab.',
                      {},
                      { context: 'gutenberg' },
                    )
              }
              checked={props.attributes.openInNewTab}
              onChange={(openInNewTab) => {
                props.setAttributes({
                  openInNewTab,
                });
              }}
            />
            <SelectControl
              label={Drupal.t('Icon', {}, { context: 'gutenberg' })}
              value={props.attributes.icon}
              options={[
                {
                  label: Drupal.t('- None -', {}, { context: 'gutenberg' }),
                  value: 'NONE',
                },
                {
                  label: Drupal.t('Arrow', {}, { context: 'gutenberg' }),
                  value: 'ARROW',
                },
              ]}
              onChange={(icon) => {
                props.setAttributes({
                  icon,
                });
              }}
            />
            {typeof props.attributes.icon !== 'undefined' &&
              props.attributes.icon !== 'NONE' && (
                <SelectControl
                  label={Drupal.t(
                    'Icon position',
                    {},
                    { context: 'gutenberg' },
                  )}
                  value={props.attributes.iconPosition}
                  options={[
                    {
                      label: Drupal.t(
                        'After button text',
                        {},
                        { context: 'gutenberg' },
                      ),
                      value: 'AFTER',
                    },
                    {
                      label: Drupal.t(
                        'Before button text',
                        {},
                        { context: 'gutenberg' },
                      ),
                      value: 'BEFORE',
                    },
                  ]}
                  onChange={(iconPosition) => {
                    props.setAttributes({
                      iconPosition,
                    });
                  }}
                />
              )}
          </PanelBody>
        </InspectorControls>
      </div>
    );
  },
  save: () => {
    return null;
  },
});
