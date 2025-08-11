import { BlockDonationFragment, Html, Image, Link, Url } from '@custom/schema';
import clsx from 'clsx';
import React, { useState } from 'react';

import { useLocale } from '../../../utils/locale';
import { FadeUp } from '../../Molecules/FadeUp';

export function BlockDonation(props: BlockDonationFragment) {
  const locale = useLocale();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const handlePresetClick = (amount: number) => {
    setSelectedAmount(amount);
  };

  const finalAmount = selectedAmount || 0;

  // Helper function to get donation type display text and styling
  const getDonationTypeInfo = (donationType: string) => {
    switch (donationType) {
      case 'GENERAL':
        return {
          label: 'General Support',
          className: 'bg-gray-100 text-gray-700 border border-gray-300',
        };
      case 'PROJECT':
        return {
          label: 'Project Funding',
          className: 'bg-blue-100 text-blue-700 border border-blue-300',
        };
      case 'MEMBERSHIP':
        return {
          label: 'Monthly Giving',
          className: 'bg-green-100 text-green-700 border border-green-300',
        };
      case 'EMERGENCY':
        return {
          label: 'Emergency Relief',
          className: 'bg-red-100 text-red-700 border border-red-300',
        };
      case 'EDUCATION':
        return {
          label: 'Education Support',
          className: 'bg-purple-100 text-purple-700 border border-purple-300',
        };
      case 'HEALTHCARE':
        return {
          label: 'Healthcare Initiative',
          className: 'bg-pink-100 text-pink-700 border border-pink-300',
        };
      case 'ENVIRONMENT':
        return {
          label: 'Environmental Project',
          className:
            'bg-emerald-100 text-emerald-700 border border-emerald-300',
        };
      default:
        return {
          label: 'Donation',
          className: 'bg-gray-100 text-gray-700 border border-gray-300',
        };
    }
  };

  const donationTypeInfo = getDonationTypeInfo(props.donationType);

  // Generate language-aware donation page URLs
  const getDonationUrl = (amount: number): Url => {
    const localeMap = {
      en: '/en/donate',
      de: '/de/spenden',
      it: '/it/donazione',
      french: '/french/don',
    };

    const basePath = localeMap[locale] || localeMap.en;
    const params = new URLSearchParams();
    params.set('amount', amount.toString());

    return `${basePath}?${params.toString()}` as Url;
  };

  return (
    <FadeUp yGap={50}>
      <div className="container-page">
        <div className="container-content">
          <div className="my-12 lg:my-16">
            <div
              className={clsx(
                'flex flex-col gap-8 lg:gap-16',
                props.image ? 'lg:flex-row lg:items-center' : 'items-center',
              )}
            >
              {/* Content Section */}
              <div
                className={clsx(
                  'w-full',
                  props.image ? 'lg:w-1/2' : 'max-w-4xl',
                )}
              >
                <div className="text-center lg:text-left">
                  {/* Donation Type Badge */}
                  <div className="mb-4 flex justify-center lg:justify-start">
                    <span
                      className={clsx(
                        'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium',
                        donationTypeInfo.className,
                      )}
                    >
                      <TypeIcon donationType={props.donationType} />
                      {donationTypeInfo.label}
                    </span>
                  </div>

                  {props.heading && (
                    <h2 className="mb-6 text-3xl font-bold text-gray-900 lg:text-4xl">
                      {props.heading}
                    </h2>
                  )}

                  {props.description && (
                    <div className="prose prose-lg mb-8 max-w-none text-gray-700">
                      <Html markup={props.description} />
                    </div>
                  )}

                  {/* Donation Form */}
                  <div className="space-y-6">
                    {/* Preset Amounts */}
                    <div>
                      <p className="mb-4 text-sm font-medium text-gray-900">
                        Choose an amount:
                      </p>
                      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        {props.presetAmounts.map(
                          (amount: number, index: number) => (
                            <button
                              key={index}
                              onClick={() => handlePresetClick(amount)}
                              className={clsx(
                                'rounded-lg border px-4 py-3 text-center font-medium transition-all duration-200 ease-in-out',
                                selectedAmount === amount
                                  ? 'border-kls-orange-primary bg-kls-orange-primary text-white shadow-lg'
                                  : 'hover:border-kls-orange-primary border-gray-300 bg-white text-gray-900 hover:bg-orange-50',
                              )}
                            >
                              CHF {amount}
                            </button>
                          ),
                        )}
                      </div>
                    </div>

                    {/* Donate Button */}
                    {finalAmount > 0 ? (
                      <Link
                        href={getDonationUrl(finalAmount)}
                        className="bg-kls-orange-primary focus:ring-kls-orange-accent flex w-full items-center justify-center rounded-lg px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-200 ease-in-out hover:bg-orange-600 hover:shadow-xl focus:outline-none focus:ring-4"
                      >
                        {props.ctaText} - CHF {finalAmount.toFixed(2)}
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="w-full cursor-not-allowed rounded-lg bg-gray-300 px-8 py-4 text-lg font-semibold text-gray-500"
                      >
                        {props.ctaText}
                      </button>
                    )}

                    {/* Trust Indicators */}
                    <div className="mt-6 flex items-center justify-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <LockIcon />
                        <span>Secure payment</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <HeartIcon />
                        <span>100% goes to the cause</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Image Section */}
              {props.image?.source && (
                <div className="w-full lg:w-1/2">
                  <div className="overflow-hidden rounded-2xl shadow-2xl">
                    <Image
                      className="h-96 w-full object-cover"
                      source={props.image.source}
                      alt={props.image.alt || 'Donation cause image'}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </FadeUp>
  );
}

// Icon Components
const TypeIcon = ({ donationType }: { donationType: string }) => {
  const iconClassName = 'mr-2 size-4';

  switch (donationType) {
    case 'GENERAL':
      return (
        <svg className={iconClassName} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      );
    case 'PROJECT':
      return (
        <svg
          className={iconClassName}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      );
    case 'MEMBERSHIP':
      return (
        <svg
          className={iconClassName}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      );
    case 'EMERGENCY':
      return (
        <svg className={iconClassName} fill="currentColor" viewBox="0 0 24 24">
          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
        </svg>
      );
    case 'EDUCATION':
      return (
        <svg
          className={iconClassName}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 14l9-5-9-5-9 5 9 5z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
          />
        </svg>
      );
    case 'HEALTHCARE':
      return (
        <svg
          className={iconClassName}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      );
    case 'ENVIRONMENT':
      return (
        <svg
          className={iconClassName}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    default:
      return (
        <svg className={iconClassName} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      );
  }
};

const LockIcon = () => (
  <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  </svg>
);

const HeartIcon = () => (
  <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);
