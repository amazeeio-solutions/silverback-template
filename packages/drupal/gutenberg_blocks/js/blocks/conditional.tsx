import clsx from 'clsx';
import React, { PropsWithChildren } from 'react';
import { InnerBlocks, InspectorControls } from 'wordpress__block-editor';
import { registerBlockType } from 'wordpress__blocks';
import {
  BaseControl,
  PanelBody,
  PanelRow,
  TextControl,
} from 'wordpress__components';

type ConditionsType = {
  [key: string]: {
    label: string;
    visible: boolean;
    template: JSX.Element;
  };
};

const blockTitle = Drupal.t(
  'Conditional content',
  {},
  { context: 'gutenberg' },
);

registerBlockType<{
  displayFrom: string;
  displayTo: string;
  purpose: string;
}>(`custom/conditional`, {
  title: blockTitle,
  category: 'layout',
  icon: 'category',
  // Allow the block only at the root level to avoid GraphQL fragment recursion.
  parent: ['custom/content'],
  attributes: {
    displayFrom: {
      type: 'string',
      default: '',
    },
    displayTo: {
      type: 'string',
      default: '',
    },
    purpose: {
      type: 'string',
      default: '',
    },
  },
  edit: (props) => {
    const { attributes, setAttributes } = props;
    const { displayFrom, displayTo, purpose } = attributes;

    // Same logic as in BlockConditional.tsx
    const active = {
      scheduledDisplay: [
        displayFrom
          ? new Date(displayFrom).getTime() <= new Date().getTime()
          : true,
        displayTo ? new Date(displayTo).getTime() > new Date().getTime() : true,
      ].every(Boolean),
    };
    const isActive = Object.values(active).every(Boolean);

    const conditions: ConditionsType = {
      scheduledDisplay: {
        label:
          '⏱️ ' + Drupal.t('Scheduled display', {}, { context: 'gutenberg' }),
        visible: !!(displayFrom || displayTo),
        template: (
          <>
            {displayFrom ? (
              <>
                <span className="font-extralight">
                  {Drupal.t('From', {}, { context: 'gutenberg' })}:
                </span>{' '}
                {new Date(displayFrom).toLocaleString()}
              </>
            ) : null}
            {displayFrom && displayTo ? ' ' : null}
            {displayTo ? (
              <>
                <span className="font-extralight">
                  {Drupal.t('To', {}, { context: 'gutenberg' })}:
                </span>{' '}
                {new Date(displayTo).toLocaleString()}
              </>
            ) : null}
          </>
        ),
      },
      device: {
        label: '📱 ' + Drupal.t('Device', {}, { context: 'gutenberg' }),
        visible: false,
        template: <>{'Mobile only.'}</>,
      },
    };

    const hasConditions = Object.values(conditions)
      .filter(({ visible }) => visible)
      .some(Boolean);

    const conditionsSummary = hasConditions ? (
      Object.entries(conditions)
        .filter(([, value]) => !!value)
        .filter(([, { visible }]) => visible)
        .map(([, { label, template }]) => (
          <>
            <div className="font-bold">{label}</div>
            {template}
          </>
        ))
    ) : (
      <>{'ℹ️ ' + Drupal.t('No conditions set', {}, { context: 'gutenberg' })}</>
    );

    return (
      <>
        <CollapsibleContainer
          title={purpose || blockTitle}
          label={blockTitle}
          isActive={isActive}
        >
          <div className="p-4 text-sm text-gray-500">{conditionsSummary}</div>
          <div className={clsx('border-t p-4', { 'bg-gray-100': !isActive })}>
            <InnerBlocks
              templateLock={false}
              template={[['core/paragraph', {}]]}
            />
          </div>
        </CollapsibleContainer>
        <InspectorControls>
          <PanelBody title={Drupal.t('Purpose', {}, { context: 'gutenberg' })}>
            <PanelRow>
              <TextControl
                id="purpose"
                hideLabelFromVision={true}
                label={Drupal.t('Purpose', {}, { context: 'gutenberg' })}
                value={purpose}
                onChange={(value: string) => setAttributes({ purpose: value })}
                help={Drupal.t(
                  'The value is not exposed to the frontend and serves to identify the reason of the conditional content (e.g. Summer Campaign).',
                  {},
                  { context: 'gutenberg' },
                )}
              />
            </PanelRow>
          </PanelBody>

          <PanelBody
            title={Drupal.t('Scheduled display', {}, { context: 'gutenberg' })}
          >
            <PanelRow className={'flex flex-col items-start gap-4'}>
              <BaseControl
                id="displayFrom"
                label={Drupal.t('From', {}, { context: 'gutenberg' })}
                className={
                  '!m-0 [&>div>label]:my-auto [&>div>label]:w-4 [&>div]:flex [&>div]:gap-4'
                }
              >
                <input
                  type="datetime-local"
                  id="displayFrom"
                  defaultValue={displayFrom ? isoToLocalTime(displayFrom) : ''}
                  onChange={(event) => {
                    setAttributes({
                      displayFrom: event.target.value
                        ? localToIsoTime(event.target.value)
                        : '',
                    });
                  }}
                />
              </BaseControl>
              <BaseControl
                id="displayTo"
                label={Drupal.t('To', {}, { context: 'gutenberg' })}
                className={
                  '!m-0 [&>div>label]:my-auto [&>div>label]:mb-0 [&>div>label]:w-4 [&>div]:flex [&>div]:gap-4'
                }
              >
                <input
                  type="datetime-local"
                  id="displayTo"
                  defaultValue={displayTo ? isoToLocalTime(displayTo) : ''}
                  onChange={(event) => {
                    setAttributes({
                      displayTo: event.target.value
                        ? localToIsoTime(event.target.value)
                        : '',
                    });
                  }}
                />
              </BaseControl>
            </PanelRow>
            <PanelRow>
              <p className={'text-xs text-neutral-500'}>
                {Drupal.t('Time zone', {}, { context: 'gutenberg' }) +
                  ': ' +
                  Intl.DateTimeFormat().resolvedOptions().timeZone}
              </p>
            </PanelRow>
          </PanelBody>
        </InspectorControls>
      </>
    );
  },
  save: () => {
    return <InnerBlocks.Content />;
  },
});

const localToIsoTime = (localTime: string) => {
  return new Date(localTime).toISOString();
};

const isoToLocalTime = (isoTime: string) => {
  const date = new Date(isoTime);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
};

const CollapsibleContainer = ({
  children,
  label,
  title,
  isActive,
}: PropsWithChildren<{ label: string; title: string; isActive: boolean }>) => {
  return (
    <>
      <details
        className={clsx('border border-gray-200', {
          'bg-gray-100': !isActive,
        })}
        open={isActive}
      >
        <summary role="button" className="grid grid-cols-[34px,1fr] p-0">
          <span
            className={
              'relative flex items-center justify-center bg-stone-500 text-white'
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              role="presentation"
              width="16"
              height="16"
              className="size-[var(--space-m)] rotate-90 transition-transform duration-[var(--details-transform-transition-duration)] ease-in"
            >
              <path
                d="M5.21 1.314L3.79 2.723l5.302 5.353-5.303 5.354 1.422 1.408 6.697-6.762z"
                fill="currentColor"
              />
            </svg>
          </span>
          <span className="col-start-2 p-4">{title}</span>
        </summary>

        <div className={'container-wrapper !m-0 !border-stone-500'}>
          <div className={'container-label'}>{label}</div>
          <div className={'container-content border-t'}>{children}</div>
        </div>
      </details>
    </>
  );
};
