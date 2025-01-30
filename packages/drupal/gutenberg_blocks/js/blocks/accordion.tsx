import { InnerBlocks, InspectorControls } from 'wordpress__block-editor';
import { registerBlockType } from 'wordpress__blocks';
import { PanelBody, SelectControl } from 'wordpress__components';

enum HeadingLevels {
  H2 = 'h2',
  H3 = 'h3',
  H4 = 'h4',
  H5 = 'h5',
}

registerBlockType<{
  headingLevel: string;
}>('custom/accordion', {
  title: Drupal.t('Accordion'),
  icon: 'menu',
  category: 'layout',
  attributes: {
    headingLevel: {
      type: 'string',
      default: HeadingLevels.H2,
    },
  },
  providesContext: {
    'custom/accordion-headingLevel': 'headingLevel',
  },
  edit: (props) => {
    const { attributes, setAttributes } = props;

    return (
      <>
        <InspectorControls>
          <PanelBody title={Drupal.t('Heading Level')}>
            <SelectControl
              value={attributes.headingLevel}
              options={[
                {
                  label: Drupal.t('Heading 2'),
                  value: HeadingLevels.H2,
                },
                {
                  label: Drupal.t('Heading 3'),
                  value: HeadingLevels.H3,
                },
                {
                  label: Drupal.t('Heading 4'),
                  value: HeadingLevels.H4,
                },
                {
                  label: Drupal.t('Heading 5'),
                  value: HeadingLevels.H5,
                },
              ]}
              onChange={(headingLevel: string) => {
                setAttributes({ headingLevel });
              }}
              help={Drupal.t(
                'The heading level will be applied to all nested accordion items.',
              )}
            />
          </PanelBody>
        </InspectorControls>

        <div className={'container-wrapper !border-stone-500'}>
          <div className={'container-label'}>{Drupal.t('Accordion')}</div>
          <InnerBlocks
            templateLock={false}
            allowedBlocks={['custom/accordion-item-text']}
            template={[['custom/accordion-item-text']]}
          />
        </div>
      </>
    );
  },
  save: () => <InnerBlocks.Content />,
});
