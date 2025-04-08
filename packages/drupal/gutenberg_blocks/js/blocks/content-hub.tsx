import React, { Fragment } from 'react';
import { InspectorControls } from 'wordpress__block-editor';
import { registerBlockType } from 'wordpress__blocks';
import {
  PanelBody,
  SelectControl,
  TextControl,
  ToggleControl,
} from 'wordpress__components';

const { setPlainTextAttribute } = silverbackGutenbergUtils;

registerBlockType<{
  showFilters: boolean;
  defaultTerm: string;
  defaultKeyword: string;
  itemsPerPage: number;
}>('custom/content-hub', {
  title: 'Content Hub',
  icon: 'grid-view',
  category: 'common',
  attributes: {
    showFilters: {
      type: 'boolean',
      default: true,
    },
    defaultTerm: {
      type: 'string',
    },
    defaultKeyword: {
      type: 'string',
    },
    itemsPerPage: {
      type: 'number',
      default: 6,
    },
  },
  edit: (props) => {
    const { attributes, setAttributes } = props;
    const { showFilters, defaultTerm, defaultKeyword, itemsPerPage } =
      attributes;

    /**
     * Convert Term Id to Term Label
     * @param domainId
     */
    const hubTermIdToTermLabel = (termId: string) => {
      const hubTerms = drupalSettings.customGutenbergBlocks.termsContentHub;
      const term = hubTerms.find((term) => term.id === termId);
      return term
        ? term.label
        : Drupal.t('Unknown term', {}, { context: 'gutenberg' });
    };

    return (
      <Fragment>
        <InspectorControls>
          <PanelBody
            title={Drupal.t(
              'Content Hub Settings',
              {},
              { context: 'gutenberg' },
            )}
          >
            <ToggleControl
              label={Drupal.t('Show Filters', {}, { context: 'gutenberg' })}
              help={Drupal.t(
                'When enabled the filters will be displayed.',
                {},
                { context: 'gutenberg' },
              )}
              checked={showFilters}
              onChange={(showFilters) => {
                setAttributes({
                  showFilters,
                });
              }}
            />

            <SelectControl
              label={Drupal.t('Items Per Page', {}, { context: 'gutenberg' })}
              value={itemsPerPage as unknown as string}
              // make an array of numbers from 1 to 25
              options={Array.from({ length: 25 }, (_, i) => ({
                label: `${i + 1}`,
                value: `${i + 1}`,
              }))}
              onChange={(itemsPerPage) => {
                setAttributes({
                  itemsPerPage: parseInt(itemsPerPage, 10),
                });
              }}
              help={Drupal.t(
                'When set this term will be used to filter the content hub and will be applied automatically to the term select field.',
                {},
                { context: 'gutenberg' },
              )}
            />

            <SelectControl
              label={Drupal.t('Default Term', {}, { context: 'gutenberg' })}
              value={defaultTerm}
              options={[
                {
                  label: Drupal.t('--- None ---', {}, { context: 'gutenberg' }),
                  value: '',
                },
                ...drupalSettings.customGutenbergBlocks.termsContentHub.map(
                  (term) => ({
                    label: term.label,
                    value: term.id,
                  }),
                ),
              ]}
              disabled={
                drupalSettings.customGutenbergBlocks.termsContentHub.length ===
                0
              }
              onChange={(defaultTerm) => {
                setAttributes({
                  defaultTerm,
                });
              }}
              help={Drupal.t(
                'When set this term will be used to filter the content hub and will be applied automatically to the term select field.',
                {},
                { context: 'gutenberg' },
              )}
            />

            <TextControl
              value={defaultKeyword}
              label={Drupal.t('Default keyword', {}, { context: 'gutenberg' })}
              onChange={(defaultKeyword) => {
                setPlainTextAttribute(props, 'defaultKeyword', defaultKeyword);
              }}
              help={Drupal.t(
                'When set this keyword will be used to filter the content hub and will be applied automatically to the search field.',
                {},
                { context: 'gutenberg' },
              )}
            />
          </PanelBody>
        </InspectorControls>
        <div className={'container-wrapper !border-stone-500'}>
          <div className={'container-label'}>
            {Drupal.t('Content Hub', {}, { context: 'gutenberg' })}
          </div>
          <div className="custom-block-content-hub">
            <div className={'details-breakdown'}>
              <div className={'details-breakdown-item'}>
                <div className={'details-breakdown-label'}>
                  {Drupal.t('Show Filters')}
                </div>
                <div className={'details-breakdown-value'}>
                  {props.attributes.showFilters === true ? (
                    <em>{Drupal.t('Yes')}</em>
                  ) : (
                    <>{Drupal.t('No')}</>
                  )}
                </div>
              </div>

              <div className={'details-breakdown-item'}>
                <div className={'details-breakdown-label'}>
                  {Drupal.t('Items Per Page')}
                </div>
                <div className={'details-breakdown-value'}>
                  {!props.attributes.itemsPerPage ? (
                    <em>{Drupal.t('6')}</em>
                  ) : (
                    <>{props.attributes.itemsPerPage as unknown as string}</>
                  )}
                </div>
              </div>

              <div className={'details-breakdown-item'}>
                <div className={'details-breakdown-label'}>
                  {Drupal.t('Default Term')}
                </div>
                <div className={'details-breakdown-value'}>
                  {!props.attributes.defaultTerm ? (
                    <em>{Drupal.t('No default term set')}</em>
                  ) : (
                    <>{hubTermIdToTermLabel(props.attributes.defaultTerm)}</>
                  )}
                </div>
              </div>

              <div className={'details-breakdown-item'}>
                <div className={'details-breakdown-label'}>
                  {Drupal.t('Default Keyword')}
                </div>
                <div className={'details-breakdown-value'}>
                  {!props.attributes.defaultKeyword ? (
                    <em>{Drupal.t('No default keyword set')}</em>
                  ) : (
                    <>{props.attributes.defaultKeyword}</>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Fragment>
    );
  },
  save() {
    return null;
  },
});
