import clsx from 'clsx';
import { ComponentType } from 'react';
import { InspectorControls } from 'wordpress__block-editor';
import { PanelBody, SelectControl } from 'wordpress__components';
import { createHigherOrderComponent } from 'wordpress__compose';
import { addFilter } from 'wordpress__hooks';

addFilter(
  'blocks.registerBlockType',
  'custom/list',
  (settings: { name: string; attributes: object }) => {
    if (settings.name === 'core/list') {
      settings.attributes = Object.assign(settings.attributes, {
        customListStyle: {
          type: 'string',
          default: '',
        },
      });
    }
    return settings;
  },
);

addFilter<ComponentType>(
  'editor.BlockEdit',
  'custom/list',
  createHigherOrderComponent(
    // eslint-disable-next-line react/display-name
    (BlockEdit) => (props) => {
      const { name, attributes, setAttributes, isSelected } = props;
      const { customListStyle, ordered } = attributes;

      if (customListStyle === undefined) {
        setAttributes({ customListStyle: '' });
      }

      return (
        <>
          <BlockEdit {...props} />
          {isSelected && name === 'core/list' && !ordered ? (
            <InspectorControls>
              <PanelBody title={Drupal.t('List style')}>
                <SelectControl
                  value={props.attributes.customListStyle}
                  options={[
                    { label: Drupal.t('Bullets'), value: '' },
                    { label: Drupal.t('Arrows'), value: 'arrows' },
                    { label: Drupal.t('Checkmarks'), value: 'checkmarks' },
                    {
                      label: Drupal.t('Question marks'),
                      value: 'question-marks',
                    },
                  ]}
                  onChange={(customListStyle: string) => {
                    setAttributes({
                      customListStyle,
                    });
                  }}
                />
              </PanelBody>
            </InspectorControls>
          ) : null}
        </>
      );
    },
    'withCustomListStyleControls',
  ),
);

addFilter<ComponentType>(
  'editor.BlockListBlock',
  'custom/list',
  createHigherOrderComponent(
    // eslint-disable-next-line react/display-name
    (BlockListBlock) => (props) => {
      const { name, attributes } = props;
      if (name === 'core/list') {
        const { customListStyle, ordered } = attributes;
        if (!ordered && customListStyle) {
          props.className = getCustomListClass(
            props.className,
            customListStyle,
          );
        }
      }
      return <BlockListBlock {...props} />;
    },
    'withCustomListStyleBlockClass',
  ),
);

addFilter(
  'blocks.getSaveContent.extraProps',
  'custom/list',
  (
    props: { className: string },
    blockType: { name: string },
    attributes: {
      customListStyle: string;
      ordered: boolean;
    },
  ) => {
    if (blockType.name === 'core/list') {
      const { customListStyle, ordered } = attributes;
      if (!ordered && customListStyle) {
        props.className = getCustomListClass(props.className, customListStyle);
      }
    }
    return props;
  },
);

function getCustomListClass(existingClassName: string, style: string) {
  return clsx(existingClassName, 'list-style--' + style);
}
