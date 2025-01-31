import { InspectorControls, RichText } from 'wordpress__block-editor';
import { registerBlockType } from 'wordpress__blocks';
import { PanelBody } from 'wordpress__components';
import { dispatch } from 'wordpress__data';

import { DrupalMediaEntity } from '../utils/drupal-media';

const { t: __ } = Drupal;
const { setPlainTextAttribute } = silverbackGutenbergUtils;

registerBlockType<{
  mediaEntityIds?: [string];
  name: string;
  birthdate: string;
}>('custom/person-teaser', {
  title: __('Person Teaser'),
  icon: 'admin-users',
  category: 'common',
  attributes: {
    mediaEntityIds: {
      type: 'array',
    },
    name: {
      type: 'string',
      default: '',
    },
    birthdate: {
      type: 'string',
      default: '',
    },
  },
  edit: (props) => {
    const { attributes, setAttributes } = props;

    return (
      <>
        <InspectorControls>
          <PanelBody title={__('Person Settings')}>
            <div className="components-base-control">
              <label className="components-base-control__label">
                {__('Birthdate')}
              </label>
              <input
                type="date"
                value={attributes.birthdate}
                onChange={(e) => {
                  setAttributes({ birthdate: e.target.value });
                }}
                className="components-text-control__input"
              />
            </div>
          </PanelBody>
        </InspectorControls>

        <div className={'container-wrapper !border-stone-500'}>
          <div className={'container-label'}>{__('Person Teaser')}</div>

          <div className="person-teaser">
            <div className="person-image">
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
            </div>

            <div className="person-details">
              <RichText
                identifier="name"
                tagName="h3"
                value={attributes.name}
                allowedFormats={[]}
                placeholder={__('Person Name')}
                keepPlaceholderOnFocus={true}
                onChange={(name) => {
                  setPlainTextAttribute(props, 'name', name);
                }}
                className="text-xl font-bold"
              />

              {attributes.birthdate && (
                <div className="text-gray-600">
                  {__('Born')}: {attributes.birthdate}
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  },
  save: () => null,
});
