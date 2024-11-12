import { InnerBlocks, InspectorControls } from 'wordpress__block-editor';
import { registerBlockType } from 'wordpress__blocks';
import { PanelBody, SelectControl } from 'wordpress__components';

import {
  iconImagePreview,
  Icons,
  limitedIconListOption,
} from '../utils/icon-list';

registerBlockType<{
  icon: string;
}>('custom/info-grid-item', {
  title: Drupal.t('Info Grid Item', {}, {context: 'gutenberg'}),
  icon: 'align-wide',
  category: 'layout',
  parent: ['custom/info-grid'],
  attributes: {
    icon: {
      type: 'string',
      default: '',
    },
  },
  edit: (props) => {
    const { setAttributes } = props;
    const iconPreview = iconImagePreview(props.attributes.icon);

    return (
      <>
        <InspectorControls>
          <PanelBody title={Drupal.t('Select an icon', {}, {context: 'gutenberg'})}>
            <SelectControl
              value={props.attributes.icon}
              options={limitedIconListOption([
                Icons.EMAIL,
                Icons.PHONE,
                Icons.LIFE_RING,
              ])}
              onChange={(icon) => {
                setAttributes({ icon });
              }}
            />
          </PanelBody>
        </InspectorControls>

        <div className={'container-wrapper !border-stone-500'}>
          <div className={'container-label'}>{Drupal.t('Info Grid Item', {}, {context: 'gutenberg'})}</div>
          <div className={'info-grid-icon'} style={{ maxWidth: '50px' }}>
            {iconPreview && (
              <img src={iconPreview} alt={props.attributes.icon} />
            )}
          </div>
          <InnerBlocks
            templateLock={false}
            allowedBlocks={['custom/heading', 'core/paragraph', 'custom/cta']}
          />
        </div>
      </>
    );
  },
  save: () => <InnerBlocks.Content />,
});
