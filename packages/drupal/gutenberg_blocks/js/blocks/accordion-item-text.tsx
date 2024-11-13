import clsx from 'clsx';
import { Fragment } from 'react';
import {
  InnerBlocks,
  InspectorControls,
  RichText,
} from 'wordpress__block-editor';
import { registerBlockType } from 'wordpress__blocks';
import { PanelBody, SelectControl } from 'wordpress__components';

registerBlockType<{
  title: string;
  icon?: string;
}>('custom/accordion-item-text', {
  title: Drupal.t('Accordion Item Text', {}, { context: 'gutenberg' }),
  icon: 'text',
  category: 'layout',
  parent: ['custom/accordion'],
  usesContext: ['custom/accordion-headingLevel'],
  attributes: {
    title: {
      type: 'string',
      default: '',
    },
    icon: {
      type: 'string',
    },
  },
  edit: (props) => {
    const { attributes, setAttributes, context } = props;
    const icons = [
      {
        label: Drupal.t(
          '- Select an optional icon -',
          {},
          { context: 'gutenberg' },
        ),
        value: '',
      },
      {
        label: Drupal.t('Checkmark', {}, { context: 'gutenberg' }),
        value: 'checkmark',
      },
      {
        label: Drupal.t('Questionmark', {}, { context: 'gutenberg' }),
        value: 'questionmark',
      },
      {
        label: Drupal.t('Arrow', {}, { context: 'gutenberg' }),
        value: 'arrow',
      },
    ];

    setAttributes({
      icon: attributes.icon === undefined ? '' : attributes.icon,
    });

    const headingLevel = context['custom/accordion-headingLevel'];

    return (
      <Fragment>
        <InspectorControls>
          <PanelBody
            title={Drupal.t('Heading Level', {}, { context: 'gutenberg' })}
          >
            <div>
              {Drupal.t(
                'Heading level is defined in the parent accordion block.',
                {},
                { context: 'gutenberg' },
              )}
            </div>
            <div>
              {Drupal.t(
                'Currently it is set to:',
                {},
                { context: 'gutenberg' },
              )}{' '}
              <strong>{headingLevel as string}</strong>
            </div>
          </PanelBody>
          <PanelBody
            title={Drupal.t('Block settings', {}, { context: 'gutenberg' })}
          >
            <SelectControl
              value={attributes.icon}
              options={icons}
              onChange={(newValue) => {
                setAttributes({
                  icon: newValue,
                });
              }}
            />
          </PanelBody>
        </InspectorControls>
        <div className={'container-wrapper !border-stone-500'}>
          <div className={'container-label'}>
            {Drupal.t('Accordion Item Text', {}, { context: 'gutenberg' })}
          </div>
          <div
            className={clsx(
              'custom-block-accordion-item-text',
              attributes.icon,
            )}
          >
            <RichText
              identifier="title"
              tagName={headingLevel as keyof HTMLElementTagNameMap}
              value={attributes.title}
              allowedFormats={[]}
              disableLineBreaks={true}
              placeholder={Drupal.t('Title', {}, { context: 'gutenberg' })}
              keepPlaceholderOnFocus={true}
              onChange={(newValue) => {
                setAttributes({ title: newValue });
              }}
            />
            <InnerBlocks
              templateLock={false}
              allowedBlocks={['core/paragraph', 'core/list', 'custom/heading']}
              template={[['core/paragraph', {}]]}
            />
          </div>
        </div>
      </Fragment>
    );
  },

  save: () => {
    return <InnerBlocks.Content />;
  },
});
