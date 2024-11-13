import { RichText } from 'wordpress__block-editor';
import { registerBlockType } from 'wordpress__blocks';
import { dispatch } from 'wordpress__data';

import { cleanUpText } from '../utils/clean-up-text';
import { DrupalMediaEntity } from '../utils/drupal-media';

const { setPlainTextAttribute } = silverbackGutenbergUtils;

registerBlockType<{
  quote: string;
  author: string;
  role: string;
  mediaEntityIds?: [string];
}>(`custom/quote`, {
  title: Drupal.t('Quote', {}, { context: 'gutenberg' }),
  icon: 'format-quote',
  category: 'text',
  attributes: {
    quote: {
      type: 'string',
      default: '',
    },
    author: {
      type: 'string',
      default: '',
    },
    role: {
      type: 'string',
      default: '',
    },
    mediaEntityIds: {
      type: 'array',
    },
  },

  edit: (props) => {
    return (
      <div className="prose lg:prose-xl prose-p:text-xl prose-p:font-bold prose-p:leading-8 prose-p:text-gray-900">
        <blockquote>
          <svg
            width="32"
            height="24"
            viewBox="0 0 32 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-labelledby="quote-svg-title"
          >
            <path
              d="M18.6893 24V14.1453C18.6893 6.54 23.664 1.38533 30.6667 0L31.9933 2.868C28.7507 4.09066 26.6667 7.71867 26.6667 10.6667H32V24H18.6893ZM0 24V14.1453C0 6.54 4.99733 1.384 12 0L13.328 2.868C10.084 4.09066 8 7.71867 8 10.6667L13.3107 10.6667V24H0Z"
              fill="#9CA3AF"
            />
          </svg>
          <RichText
            identifier="quote"
            value={props.attributes.quote}
            allowedFormats={['core/bold']}
            disableLineBreaks={false}
            placeholder={Drupal.t('Quote', {}, { context: 'gutenberg' })}
            keepPlaceholderOnFocus={false}
            onChange={(quote) => {
              props.setAttributes({
                quote: cleanUpText(quote, ['strong']),
              });
            }}
          />
          <div className="not-prose flex flex-wrap items-center">
            <div className="quote-image mr-3">
              <DrupalMediaEntity
                attributes={{
                  ...props.attributes,
                  lockViewMode: true,
                  allowedTypes: ['image'],
                  viewMode: 'quote',
                }}
                setAttributes={props.setAttributes}
                isMediaLibraryEnabled={true}
                onError={(error) => {
                  error = typeof error === 'string' ? error : error[2];
                  dispatch('core/notices').createWarningNotice(error);
                }}
              />
            </div>
            <RichText
              identifier="author"
              value={props.attributes.author}
              allowedFormats={[]}
              disableLineBreaks={false}
              placeholder={Drupal.t('Author', {}, { context: 'gutenberg' })}
              keepPlaceholderOnFocus={false}
              onChange={(author) => {
                setPlainTextAttribute(props, 'author', author);
              }}
            />
            <span className="ml-3 text-base">/</span>
            <RichText
              identifier="role"
              className="ml-3 mt-0.5 text-sm not-italic text-gray-500"
              value={props.attributes.role}
              allowedFormats={[]}
              disableLineBreaks={false}
              placeholder={Drupal.t('Role', {}, { context: 'gutenberg' })}
              keepPlaceholderOnFocus={false}
              onChange={(role) => {
                setPlainTextAttribute(props, 'role', role);
              }}
            />
          </div>
        </blockquote>
      </div>
    );
  },
  save: () => {
    return null;
  },
});
