import { InnerBlocks, InspectorControls } from 'wordpress__block-editor';
import { registerBlockType } from 'wordpress__blocks';
import {
  PanelBody,
  SelectControl,
  TextControl,
  ToggleControl,
} from 'wordpress__components';

const { setPlainTextAttribute } = silverbackGutenbergUtils;

registerBlockType<{
  layout: string;
  buttonText: string;
  contentHubEnabled?: boolean;
  limit: number;
  titleFilter: string;
}>('custom/teaser-list', {
  title: Drupal.t('Teaser list'),
  icon: 'slides',
  category: 'layout',
  attributes: {
    layout: {
      type: 'string',
      default: 'GRID',
    },
    buttonText: {
      type: 'string',
      default: '',
    },
    contentHubEnabled: {
      type: 'boolean',
    },
    limit: {
      type: 'number',
      default: 0,
    },
    titleFilter: {
      type: 'string',
      default: '',
    },
  },
  edit: (props) => {
    const { attributes, setAttributes } = props;
    const { layout, buttonText, contentHubEnabled, limit, titleFilter } =
      attributes;

    return (
      <div className={'container-wrapper !border-stone-500'}>
        <div className={'container-label'}>{Drupal.t('Teaser list')}</div>
        <InspectorControls>
          <PanelBody>
            <SelectControl
              label={Drupal.t('Layout')}
              value={layout}
              options={[
                { label: Drupal.t('Grid'), value: 'GRID' },
                { label: Drupal.t('Carousel'), value: 'CAROUSEL' },
              ]}
              onChange={(layout) => {
                setAttributes({
                  layout,
                });
              }}
            />
            <TextControl
              value={buttonText}
              label={Drupal.t('Button text')}
              onChange={(buttonText) => {
                setPlainTextAttribute(props, 'buttonText', buttonText);
              }}
              help={Drupal.t(
                'A text to show for the read more link. Leave empty to use the default one (Read more).',
              )}
            />
            <ToggleControl
              label={Drupal.t('Enable content hub')}
              help={Drupal.t(
                'Enable pulling dynamic content from the content hub.',
              )}
              checked={contentHubEnabled}
              onChange={(contentHubEnabled) => {
                setAttributes({
                  contentHubEnabled,
                });
              }}
            />
            {typeof contentHubEnabled !== 'undefined' && contentHubEnabled ? (
              <TextControl
                label={Drupal.t('Filter: Title')}
                help={Drupal.t('Filter results by title / label.')}
                onChange={(titleFilter) => {
                  setAttributes({
                    titleFilter,
                  });
                }}
                value={titleFilter}
              />
            ) : null}
            {typeof contentHubEnabled !== 'undefined' && contentHubEnabled ? (
              <TextControl
                label={Drupal.t('Limit')}
                help={Drupal.t(
                  'Set a maximum number of results to show from the content hub.',
                )}
                onChange={(limit) => {
                  setAttributes({
                    limit: Math.max(0, parseInt(limit) || 0),
                  });
                }}
                value={limit}
              />
            ) : null}
          </PanelBody>
        </InspectorControls>
        <InnerBlocks
          templateLock={false}
          allowedBlocks={['custom/teaser-item']}
          template={[]}
        />
      </div>
    );
  },
  save: () => <InnerBlocks.Content />,
});
