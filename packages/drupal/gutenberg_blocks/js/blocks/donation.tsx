import { InspectorControls, RichText } from 'wordpress__block-editor';
import { registerBlockType } from 'wordpress__blocks';
import {
  Button,
  PanelBody,
  SelectControl,
  TextControl,
  ToggleControl,
} from 'wordpress__components';
import { dispatch } from 'wordpress__data';
import * as React from 'react';

import { DrupalMediaEntity } from '../utils/drupal-media';

const { setPlainTextAttribute } = silverbackGutenbergUtils;

interface DonationBlockAttributes {
  mediaEntityIds?: [string];
  heading: string;
  ctaText: string;
  description: string;
  presetAmounts: number[];
  donationType: string;
}

const DONATION_TYPES = [
  { label: 'General Donation', value: 'GENERAL' },
  { label: 'Emergency Fund', value: 'EMERGENCY' },
  { label: 'Education Support', value: 'EDUCATION' },
  { label: 'Healthcare Initiative', value: 'HEALTHCARE' },
  { label: 'Environmental Project', value: 'ENVIRONMENT' },
  { label: 'Project Donation', value: 'PROJECT' },
  { label: 'Membership', value: 'MEMBERSHIP' },
];

registerBlockType<DonationBlockAttributes>('custom/donation', {
  title: Drupal.t('Donation', {}, { context: 'gutenberg' }),
  icon: 'heart',
  category: 'common',
  attributes: {
    mediaEntityIds: {
      type: 'array',
    },
    heading: {
      type: 'string',
      default: Drupal.t('Support Our Cause', {}, { context: 'gutenberg' }),
    },
    ctaText: {
      type: 'string',
      default: Drupal.t('Donate Now', {}, { context: 'gutenberg' }),
    },
    description: {
      type: 'string',
      default: '',
    },
    presetAmounts: {
      type: 'array',
      default: [25, 50, 100, 250],
    },
    donationType: {
      type: 'string',
      default: 'GENERAL',
    },
  },
  edit: (props) => {
    const { attributes, setAttributes } = props;

    // Ensure presetAmounts is always a valid array, deserializing if needed
    let safePresetAmounts;
    try {
      if (typeof attributes.presetAmounts === 'string') {
        // Deserialize from JSON string
        safePresetAmounts = JSON.parse(attributes.presetAmounts);
      } else if (Array.isArray(attributes.presetAmounts)) {
        safePresetAmounts = [...attributes.presetAmounts];
      } else {
        safePresetAmounts = [25, 50, 100, 250];
      }
    } catch (e) {
      // If JSON parsing fails, use default values
      safePresetAmounts = [25, 50, 100, 250];
    }
    
    // Ensure all values are numbers
    safePresetAmounts = safePresetAmounts.map(amount => 
      typeof amount === 'number' ? amount : parseFloat(amount) || 0
    );

    // Ensure default values are persisted when block is first created
    React.useEffect(() => {
      if (!attributes.presetAmounts || attributes.presetAmounts.length === 0) {
        const defaultAmounts = [25, 50, 100, 250];
        setAttributes({ presetAmounts: defaultAmounts });
      }
    }, []);

    // Handle serialization whenever presetAmounts changes
    React.useEffect(() => {
      if (Array.isArray(attributes.presetAmounts) && attributes.presetAmounts.length > 0) {
        setPlainTextAttribute(props, 'presetAmounts', JSON.stringify(attributes.presetAmounts));
      }
    }, [attributes.presetAmounts]);


    const addPresetAmount = () => {
      const newAmounts = [...safePresetAmounts, 0];
      setAttributes({ presetAmounts: newAmounts });
    };

    const updatePresetAmount = (index: number, value: string) => {
      // Validate amount format (numbers and decimal point only)
      if (value && !/^\d*\.?\d*$/.test(value)) {
        return; // Don't update if invalid format
      }

      const numericValue = parseFloat(value) || 0;
      const updatedAmounts = [...safePresetAmounts];
      updatedAmounts[index] = numericValue;
      setAttributes({ presetAmounts: updatedAmounts });
    };

    const finalizePresetAmount = (index: number, value: string) => {
      // This is called onBlur - no stringification needed here
      // The serialization effect will handle persistence automatically
    };

    const removePresetAmount = (index: number) => {
      const filteredAmounts = safePresetAmounts.filter((_, i) => i !== index);
      setAttributes({ presetAmounts: filteredAmounts });
    };

    return (
      <>
        <InspectorControls>
          <PanelBody
            title={Drupal.t('Donation Settings', {}, { context: 'gutenberg' })}
          >
            <SelectControl
              label={Drupal.t('Donation Type', {}, { context: 'gutenberg' })}
              value={attributes.donationType}
              options={DONATION_TYPES.map((type) => ({
                label: Drupal.t(type.label, {}, { context: 'gutenberg' }),
                value: type.value,
              }))}
              onChange={(donationType) => {
                setAttributes({ donationType });
              }}
              help={Drupal.t(
                'Select the type of donation campaign',
                {},
                { context: 'gutenberg' },
              )}
            />

          </PanelBody>

          <PanelBody
            title={Drupal.t('Donation Amounts', {}, { context: 'gutenberg' })}
          >
            {safePresetAmounts.map((amount, index) => (
              <div key={index} style={{ marginBottom: '16px' }}>
                <div
                  style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}
                >
                  <TextControl
                    label={`${Drupal.t('Amount', {}, { context: 'gutenberg' })} ${index + 1}`}
                    value={amount.toString()}
                    onChange={(value) => updatePresetAmount(index, value)}
                    onBlur={(event) => finalizePresetAmount(index, event.target.value)}
                    placeholder="50"
                    help={
                      index === 0
                        ? Drupal.t(
                            'Enter amount without currency symbol',
                            {},
                            { context: 'gutenberg' },
                          )
                        : undefined
                    }
                  />
                  {safePresetAmounts.length > 1 && (
                    <Button
                      isDestructive
                      variant="secondary"
                      onClick={() => removePresetAmount(index)}
                      style={{ 
                        marginTop: '28px',
                        height: '36px',
                        minHeight: '36px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {Drupal.t('Remove', {}, { context: 'gutenberg' })}
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <Button
              variant="secondary"
              onClick={addPresetAmount}
              style={{ marginTop: '8px' }}
            >
              {Drupal.t('Add Amount', {}, { context: 'gutenberg' })}
            </Button>
          </PanelBody>
        </InspectorControls>

        <div className="donation-block-editor">
          {/* Optional Image Section */}
          <div style={{ marginBottom: '20px' }}>
            <DrupalMediaEntity
              classname="w-full"
              attributes={{
                ...attributes,
                lockViewMode: true,
                viewMode: 'gutenberg_header',
                allowedTypes: ['image'],
              }}
              setAttributes={setAttributes}
              isMediaLibraryEnabled={true}
              onError={(error) => {
                error = typeof error === 'string' ? error : error[2];
                dispatch('core/notices').createWarningNotice(error);
              }}
            />
          </div>

          {/* Main Donation Content */}
          <div
            className="donation-content"
            style={{
              padding: '24px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              backgroundColor: '#f9f9f9',
            }}
          >
            {/* Heading */}
            <div style={{ marginBottom: '16px' }}>
              <RichText
                identifier="heading"
                tagName="h3"
                value={attributes.heading}
                allowedFormats={[]}
                disableLineBreaks={true}
                placeholder={Drupal.t(
                  'Add donation heading...',
                  {},
                  { context: 'gutenberg' },
                )}
                keepPlaceholderOnFocus={true}
                onChange={(heading) => {
                  setPlainTextAttribute(props, 'heading', heading);
                }}
                style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  margin: '0',
                  color: '#333',
                }}
              />
            </div>

            {/* Donation Type Badge */}
            <div style={{ marginBottom: '16px' }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  backgroundColor: '#e3f2fd',
                  color: '#1976d2',
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: '500',
                }}
              >
                {
                  DONATION_TYPES.find(
                    (type) => type.value === attributes.donationType,
                  )?.label
                }
              </span>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '20px' }}>
              <RichText
                identifier="description"
                tagName="div"
                value={attributes.description}
                allowedFormats={['core/bold', 'core/italic']}
                placeholder={Drupal.t(
                  'Add a description about this donation campaign...',
                  {},
                  { context: 'gutenberg' },
                )}
                keepPlaceholderOnFocus={true}
                onChange={(description) => {
                  setPlainTextAttribute(props, 'description', description);
                }}
                style={{
                  fontSize: '16px',
                  lineHeight: '1.5',
                  color: '#333',
                }}
              />
            </div>

            {/* Donation Amounts Grid */}
            <div style={{ marginBottom: '20px' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                  gap: '12px',
                  marginBottom: '16px',
                }}
              >
                {safePresetAmounts
                  .filter((amount) => amount > 0)
                  .map((amount, index) => (
                    <div
                      key={`${amount}-${index}`}
                      style={{
                        padding: '12px',
                        border: '2px solid #e0e0e0',
                        borderRadius: '6px',
                        textAlign: 'center',
                        backgroundColor: '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <span style={{ fontSize: '18px', fontWeight: '600' }}>
                        CHF {amount}
                      </span>
                    </div>
                  ))}
              </div>

            </div>


            {/* CTA Button */}
            <div style={{ textAlign: 'center' }}>
              <RichText
                identifier="ctaText"
                tagName="span"
                value={attributes.ctaText}
                allowedFormats={[]}
                disableLineBreaks={true}
                placeholder={Drupal.t(
                  'Donate Now',
                  {},
                  { context: 'gutenberg' },
                )}
                keepPlaceholderOnFocus={true}
                onChange={(ctaText) => {
                  setPlainTextAttribute(props, 'ctaText', ctaText);
                }}
                style={{
                  display: 'inline-block',
                  padding: '12px 24px',
                  backgroundColor: '#1976d2',
                  color: '#fff',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: 'text',
                  minWidth: '120px',
                }}
              />
            </div>
          </div>
        </div>
      </>
    );
  },
  save: () => {
    return null;
  },
});
