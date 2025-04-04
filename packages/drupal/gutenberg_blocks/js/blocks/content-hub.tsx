import React, { Fragment } from 'react';
import { InspectorControls, RichText } from 'wordpress__block-editor';
import { registerBlockType } from 'wordpress__blocks';
import { PanelBody } from 'wordpress__components';

const { t: __ } = Drupal;

registerBlockType<{
  showFilters: boolean;
  defaultTerm: string;
  defaultKeyword: string;
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
  },
  edit: (props) => {
    const { attributes, setAttributes } = props;

    // Set default values this way so that values get saved in the block's attributes.
    //props.setAttributes({
    //  isQuote:
    //    props.attributes.isQuote === undefined
    //      ? false
    //      : props.attributes.isQuote,
    //});

    return (
      <Fragment>
        <InspectorControls>
          <PanelBody title={__('Block settings')}>
            <p>Block settings</p>
          </PanelBody>
        </InspectorControls>
        <div className={'container-wrapper'}>
          <div className={'container-label'}>{__('Content Hub')}</div>
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
                  {Drupal.t('Default Term')}
                </div>
                <div className={'details-breakdown-value'}>
                  {!props.attributes.defaultTerm ? (
                    <em>{Drupal.t('No default term set')}</em>
                  ) : (
                    <>{props.attributes.defaultTerm}</>
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
