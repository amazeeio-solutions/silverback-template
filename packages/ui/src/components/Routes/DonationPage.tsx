import { useIntl } from '@amazeelabs/react-intl';
import {
  Html,
  Image,
  Markup,
  PageFragment,
  Url,
  useLocation,
  ViewPageQuery,
} from '@custom/schema';
import clsx from 'clsx';
import React from 'react';

import { isTruthy } from '../../utils/isTruthy';
import { Translations } from '../../utils/translations';
import { withOperation } from '../../utils/with-operation';
import { BreadCrumbs } from '../Molecules/Breadcrumbs';
import { ContentEditLink } from '../Molecules/ContentEditLink';
import { PageTransition } from '../Molecules/PageTransition';
import { DonationForm, DonationFormData } from '../Organisms/DonationForm';
import { BlockAccordion } from '../Organisms/PageContent/BlockAccordion';
import { BlockConditional } from '../Organisms/PageContent/BlockConditional';
import { BlockCta } from '../Organisms/PageContent/BlockCta';
import { BlockDonation } from '../Organisms/PageContent/BlockDonation';
import { BlockForm } from '../Organisms/PageContent/BlockForm';
import { BlockHorizontalSeparator } from '../Organisms/PageContent/BlockHorizontalSeparator';
import { BlockImageTeasers } from '../Organisms/PageContent/BlockImageTeasers';
import { BlockImageWithText } from '../Organisms/PageContent/BlockImageWithText';
import { BlockInfoGrid } from '../Organisms/PageContent/BlockInfoGrid';
import { BlockMarkup } from '../Organisms/PageContent/BlockMarkup';
import { BlockMedia } from '../Organisms/PageContent/BlockMedia';
import { BlockQuote } from '../Organisms/PageContent/BlockQuote';
import { BlockTeaserList } from '../Organisms/PageContent/BlockTeaserList';

// Extended type for DonationPage with additional fields
type DonationPageDisplayProps = PageFragment & {
  goalAmount?: number;
  currentAmount?: number;
  campaignEndDate?: string;
  campaignDescription?: Markup;
};

function DonationPageDisplay(props: DonationPageDisplayProps) {
  const intl = useIntl();
  const [, navigate] = useLocation();

  // Calculate progress percentage
  const progressPercentage =
    props.goalAmount && props.currentAmount
      ? Math.min((props.currentAmount / props.goalAmount) * 100, 100)
      : 0;

  // Parse campaign end date
  const campaignEndDate = props.campaignEndDate
    ? new Date(props.campaignEndDate)
    : null;
  const isExpired = campaignEndDate ? campaignEndDate < new Date() : false;
  const daysRemaining = campaignEndDate
    ? Math.max(
        0,
        Math.ceil(
          (campaignEndDate.getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      )
    : null;

  const handleDonationSubmit = async (data: DonationFormData) => {
    try {
      // TODO: Implement donation mutation
      console.log('Donation data:', data);

      // For now, redirect to a success page
      const localePrefix =
        intl.locale === 'french' ? 'french' : intl.locale.replace('_', '-');
      const successUrl = `/${localePrefix}/donation/success`;
      navigate(successUrl as Url);
    } catch (error) {
      console.error('Donation failed:', error);
      // TODO: Show error message
    }
  };

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8">
        <BreadCrumbs />
        {props.editLink && <ContentEditLink {...props.editLink} />}

        {/* Hero Section */}
        {props.hero && (
          <div className="mb-12">
            {props.hero.image?.landscape && (
              <div className="relative mb-8 overflow-hidden rounded-2xl">
                <Image
                  className="h-96 w-full object-cover lg:h-[500px]"
                  source={props.hero.image.landscape}
                  alt={props.hero.image.alt || props.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <h1 className="mb-4 text-4xl font-bold lg:text-5xl">
                    {props.hero.headline || props.title}
                  </h1>
                  {props.hero.lead && (
                    <p className="text-xl text-gray-100 lg:text-2xl">
                      {props.hero.lead}
                    </p>
                  )}
                </div>
              </div>
            )}

            {!props.hero.image?.landscape && (
              <div className="mb-8 text-center">
                <h1 className="mb-4 text-4xl font-bold text-gray-900 lg:text-5xl">
                  {props.hero.headline || props.title}
                </h1>
                {props.hero.lead && (
                  <p className="text-xl text-gray-600 lg:text-2xl">
                    {props.hero.lead}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {!props.hero && (
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold text-gray-900 lg:text-5xl">
              {props.title}
            </h1>
          </div>
        )}

        {/* Campaign Progress */}
        {(props.goalAmount || props.currentAmount || campaignEndDate) && (
          <div className="mb-12">
            <div className="rounded-2xl bg-white p-8 shadow-lg">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Amount Raised */}
                {(props.currentAmount !== undefined ||
                  props.goalAmount !== undefined) && (
                  <div className="text-center lg:text-left">
                    <div className="text-kls-orange-primary text-3xl font-bold">
                      CHF {(props.currentAmount || 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      {intl.formatMessage({
                        id: 'ohe8G0',
                        defaultMessage: 'raised',
                      })}
                      {props.goalAmount && (
                        <span>
                          {' '}
                          {intl.formatMessage(
                            {
                              id: 'uZ/MG7',
                              defaultMessage: 'of CHF {goal}',
                            },
                            { goal: props.goalAmount.toLocaleString() },
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Progress Bar */}
                {props.goalAmount && props.currentAmount !== undefined && (
                  <div className="lg:col-span-1">
                    <div className="mb-2 text-center text-sm font-medium text-gray-700">
                      {progressPercentage.toFixed(1)}%{' '}
                      {intl.formatMessage({
                        id: 'goAUOy',
                        defaultMessage: 'of goal reached',
                      })}
                    </div>
                    <div className="h-4 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="from-kls-orange-primary h-full bg-gradient-to-r to-orange-500 transition-all duration-700 ease-out"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Time Remaining */}
                {campaignEndDate && (
                  <div className="text-center lg:text-right">
                    <div
                      className={clsx(
                        'text-3xl font-bold',
                        isExpired ? 'text-red-600' : 'text-gray-900',
                      )}
                    >
                      {isExpired
                        ? intl.formatMessage({
                            id: 'RahCRH',
                            defaultMessage: 'Expired',
                          })
                        : daysRemaining}
                    </div>
                    <div className="text-sm text-gray-600">
                      {isExpired
                        ? intl.formatMessage({
                            id: 'd/DAhL',
                            defaultMessage: 'Campaign ended',
                          })
                        : daysRemaining === 1
                          ? intl.formatMessage({
                              id: 'SGozZE',
                              defaultMessage: 'day remaining',
                            })
                          : intl.formatMessage({
                              id: '6WM3op',
                              defaultMessage: 'days remaining',
                            })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Campaign Description */}
            {props.campaignDescription && (
              <div className="mb-8">
                <div className="prose prose-lg max-w-none">
                  <Html markup={props.campaignDescription} />
                </div>
              </div>
            )}

            {/* Page Content Blocks */}
            {props.content && props.content.length > 0 && (
              <div className="space-y-8">
                {props.content.filter(isTruthy).map((block, index) => {
                  // Use the same pattern as PageDisplay - handle each block type
                  switch (block.__typename) {
                    case 'BlockMedia':
                      return <BlockMedia key={index} {...block} />;
                    case 'BlockMarkup':
                      return <BlockMarkup key={index} {...block} />;
                    case 'BlockForm':
                      return <BlockForm key={index} {...block} />;
                    case 'BlockImageTeasers':
                      return <BlockImageTeasers key={index} {...block} />;
                    case 'BlockCta':
                      return <BlockCta key={index} {...block} />;
                    case 'BlockImageWithText':
                      return <BlockImageWithText key={index} {...block} />;
                    case 'BlockQuote':
                      return <BlockQuote key={index} {...block} />;
                    case 'BlockHorizontalSeparator':
                      return (
                        <BlockHorizontalSeparator key={index} {...block} />
                      );
                    case 'BlockAccordion':
                      return <BlockAccordion key={index} {...block} />;
                    case 'BlockInfoGrid':
                      return <BlockInfoGrid key={index} {...block} />;
                    case 'BlockDonation':
                      return <BlockDonation key={index} {...block} />;
                    case 'BlockTeaserList':
                      return <BlockTeaserList key={index} {...block} />;
                    case 'BlockConditional':
                      return <BlockConditional key={index} {...block} />;
                    default:
                      return null;
                  }
                })}
              </div>
            )}
          </div>

          {/* Donation Form Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="rounded-2xl bg-white p-8 shadow-lg">
                <h2 className="mb-6 text-2xl font-bold text-gray-900">
                  {intl.formatMessage({
                    id: 'DqoWQQ',
                    defaultMessage: 'Donate Now',
                  })}
                </h2>

                {isExpired ? (
                  <div className="rounded-lg bg-red-50 p-6 text-center">
                    <div className="text-red-600">
                      <svg
                        className="mx-auto mb-2 size-12"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <h3 className="text-lg font-semibold">
                        {intl.formatMessage({
                          id: '3nPDd9',
                          defaultMessage: 'Campaign Expired',
                        })}
                      </h3>
                      <p className="mt-2 text-sm">
                        {intl.formatMessage({
                          id: 'rf+Hre',
                          defaultMessage: 'This donation campaign has ended.',
                        })}
                      </p>
                    </div>
                  </div>
                ) : (
                  <DonationForm
                    presetAmounts={[25, 50, 100, 250]}
                    onSubmit={handleDonationSubmit}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

export const DonationPageWithData = withOperation(ViewPageQuery, (result) => {
  // Initialize the language switcher with the options this page has.
  const translations = Object.fromEntries(
    result?.page?.translations
      ?.filter(isTruthy)
      .map((translation) => [translation.locale, translation.path]) || [],
  );

  // Cast the page data to include donation-specific fields
  const donationPage = result?.page as DonationPageDisplayProps;

  return donationPage ? (
    <Translations translations={translations}>
      <DonationPageDisplay {...donationPage} />
    </Translations>
  ) : null;
});

export function DonationPage() {
  // Retrieve the current location and load the page behind it.
  const [loc] = useLocation();
  return <DonationPageWithData pathname={loc.pathname} />;
}
