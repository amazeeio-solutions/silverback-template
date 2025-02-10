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
  title: Drupal.t('Teaser list', {}, { context: 'gutenberg' }),
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
        <div className={'container-label'}>
          {Drupal.t('Teaser list', {}, { context: 'gutenberg' })}
        </div>
        <InspectorControls>
          <PanelBody>
            <SelectControl
              label={Drupal.t('Layout', {}, { context: 'gutenberg' })}
              value={layout}
              options={[
                {
                  label: Drupal.t('Grid', {}, { context: 'gutenberg' }),
                  value: 'GRID',
                },
                {
                  label: Drupal.t('Carousel', {}, { context: 'gutenberg' }),
                  value: 'CAROUSEL',
                },
              ]}
              onChange={(layout) => {
                setAttributes({
                  layout,
                });
              }}
            />
            <TextControl
              value={buttonText}
              label={Drupal.t('Button text', {}, { context: 'gutenberg' })}
              onChange={(buttonText) => {
                setPlainTextAttribute(props, 'buttonText', buttonText);
              }}
              help={Drupal.t(
                'A text to show for the read more link. Leave empty to use the default one (Read more).',
                {},
                { context: 'gutenberg' },
              )}
            />
            <ToggleControl
              label={Drupal.t(
                'Enable content hub',
                {},
                { context: 'gutenberg' },
              )}
              help={Drupal.t(
                'Enable pulling dynamic content from the content hub.',
                {},
                { context: 'gutenberg' },
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
                label={Drupal.t('Filter: Title', {}, { context: 'gutenberg' })}
                help={Drupal.t(
                  'Filter results by title / label.',
                  {},
                  { context: 'gutenberg' },
                )}
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
                label={Drupal.t('Limit', {}, { context: 'gutenberg' })}
                help={Drupal.t(
                  'Set a maximum number of results to show from the content hub.',
                  {},
                  { context: 'gutenberg' },
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
