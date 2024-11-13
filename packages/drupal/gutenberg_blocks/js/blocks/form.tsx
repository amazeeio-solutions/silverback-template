import { InnerBlocks, InspectorControls } from 'wordpress__block-editor';
import { registerBlockType } from 'wordpress__blocks';
import { PanelBody, SelectControl } from 'wordpress__components';

registerBlockType<{
  formId?: string;
}>(`custom/form`, {
  title: Drupal.t('Form', {}, { context: 'gutenberg' }),
  icon: 'media-document',
  category: 'layout',
  attributes: {
    formId: {
      type: 'string',
    },
  },
  supports: {
    anchor: true,
  },
  edit: (props) => (
    <>
      <InspectorControls>
        <PanelBody>
          <SelectControl
            value={props.attributes.formId}
            options={[
              {
                label: Drupal.t(
                  '- Select a form -',
                  {},
                  { context: 'gutenberg' },
                ),
                value: '',
              },
              ...drupalSettings.customGutenbergBlocks.forms.map((form) => ({
                label: form.label,
                value: form.id,
              })),
            ]}
            onChange={(formId) => {
              props.setAttributes({
                formId,
              });
            }}
          />
        </PanelBody>
      </InspectorControls>
      <div className={'container-wrapper !border-stone-500'}>
        <div className={'container-label'}>
          {Drupal.t('Form', {}, { context: 'gutenberg' })}
        </div>
        {props.attributes.formId ? (
          <iframe
            src={
              drupalSettings.customGutenbergBlocks.forms.find(
                (form) => form.id === props.attributes.formId,
              )!.url + '?iframe=true'
            }
            style={{ width: '100%', height: 300, pointerEvents: 'none' }}
          />
        ) : (
          <p>
            {Drupal.t(
              'Please select a form in the sidebar',
              {},
              { context: 'gutenberg' },
            )}
          </p>
        )}
      </div>
    </>
  ),
  save: () => <InnerBlocks.Content />,
});
