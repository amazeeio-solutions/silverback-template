import { useIntl } from '@amazeelabs/react-intl';
import { DonationFrequency, useLocation } from '@custom/schema';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';

export interface DonationFormProps {
  presetAmounts?: number[];
  ctaText?: string;
  onSubmit?: (data: DonationFormData) => void;
  isLoading?: boolean;
  preselectedAmount?: string;
}

export interface DonationFormData {
  amount: number;
  frequency: DonationFrequency;
  firstName: string;
  lastName: string;
  email: string;
  message?: string;
  anonymous: boolean;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

export function DonationForm({
  presetAmounts = [25, 50, 100, 250],
  ctaText,
  onSubmit,
  isLoading = false,
  preselectedAmount,
}: DonationFormProps) {
  const intl = useIntl();
  const [location] = useLocation();

  // Form state
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: '',
    anonymous: false,
    address: '',
    city: '',
    postalCode: '',
    country: 'CH',
  });

  // Handle preselected amount from props or URL parameter
  useEffect(() => {
    // First check props, then URL parameters
    const amountSource =
      preselectedAmount || new URLSearchParams(location.search).get('amount');

    if (amountSource) {
      const amount = parseFloat(amountSource);
      if (!isNaN(amount) && amount > 0) {
        if (presetAmounts.includes(amount)) {
          setSelectedAmount(amount);
        }
      }
    }
  }, [preselectedAmount, location.search, presetAmounts]);

  const handlePresetClick = (amount: number) => {
    setSelectedAmount(amount);
  };

  const handleInputChange = (
    field: keyof typeof formData,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const finalAmount = selectedAmount || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (finalAmount <= 0) return;

    const donationData: DonationFormData = {
      amount: finalAmount,
      frequency: DonationFrequency.Once,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      message: formData.message || undefined,
      anonymous: formData.anonymous,
      address: formData.address || undefined,
      city: formData.city || undefined,
      postalCode: formData.postalCode || undefined,
      country: formData.country || undefined,
    };

    onSubmit?.(donationData);
  };

  const defaultCtaText = intl.formatMessage({
    id: 'DqoWQQ',
    defaultMessage: 'Donate Now',
  });

  const pageTitle = intl.formatMessage({
    id: '+tEame',
    defaultMessage: 'Make a Donation',
  });

  const pageSubtitle = intl.formatMessage({
    id: 'ZJl/in',
    defaultMessage:
      'Your support makes a real difference in the fight against cancer. Every donation helps us provide vital services and support to those who need it most.',
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
          {pageTitle}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
          {pageSubtitle}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Amount Selection */}
        <div>
          <h3 className="mb-6 text-xl font-semibold text-gray-900">
            {intl.formatMessage({
              id: 'BjBR3Q',
              defaultMessage: 'Choose your donation amount',
            })}
          </h3>

          {/* Preset Amounts */}
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {presetAmounts.map((amount: number, index: number) => (
                <button
                  key={index}
                  type="button"
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
              ))}
            </div>
          </div>

        </div>

        {/* Personal Information */}
        <div>
          <h4 className="mb-4 text-lg font-semibold text-gray-900">
            {intl.formatMessage({
              id: 'Xt6tlr',
              defaultMessage: 'Your information',
            })}
          </h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">
                {intl.formatMessage({
                  id: 'pONqz8',
                  defaultMessage: 'First name',
                })}{' '}
                *
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="focus:border-kls-orange-primary focus:ring-kls-orange-accent w-full rounded-lg border border-gray-300 px-3 py-3 text-gray-900 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-4"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">
                {intl.formatMessage({
                  id: 'txUL0F',
                  defaultMessage: 'Last name',
                })}{' '}
                *
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="focus:border-kls-orange-primary focus:ring-kls-orange-accent w-full rounded-lg border border-gray-300 px-3 py-3 text-gray-900 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-4"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-gray-900">
              {intl.formatMessage({
                id: 'hJZwTS',
                defaultMessage: 'Email address',
              })}{' '}
              *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="focus:border-kls-orange-primary focus:ring-kls-orange-accent w-full rounded-lg border border-gray-300 px-3 py-3 text-gray-900 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-4"
            />
          </div>
        </div>

        {/* Optional Message */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-900">
            {intl.formatMessage({
              id: 'NrvqoY',
              defaultMessage: 'Optional message',
            })}
          </label>
          <textarea
            rows={4}
            value={formData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            placeholder={intl.formatMessage({
              id: 'HsqCO/',
              defaultMessage: 'Share why this cause matters to you...',
            })}
            className="focus:border-kls-orange-primary focus:ring-kls-orange-accent w-full rounded-lg border border-gray-300 px-3 py-3 text-gray-900 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-4"
          />
        </div>

        {/* Anonymous Option */}
        <div>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.anonymous}
              onChange={(e) => handleInputChange('anonymous', e.target.checked)}
              className="text-kls-orange-primary focus:ring-kls-orange-accent size-4 rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">
              {intl.formatMessage({
                id: 'utkbny',
                defaultMessage: 'Make this donation anonymous',
              })}
            </span>
          </label>
        </div>

        {/* Address Information for Tax Receipt */}
        <div>
          <h4 className="mb-4 text-lg font-semibold text-gray-900">
            {intl.formatMessage({
              id: '3UBtyq',
              defaultMessage: 'Address (optional, for tax receipt)',
            })}
          </h4>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">
                {intl.formatMessage({
                  id: 'VYn2g8',
                  defaultMessage: 'Street address',
                })}
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="focus:border-kls-orange-primary focus:ring-kls-orange-accent w-full rounded-lg border border-gray-300 px-3 py-3 text-gray-900 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-4"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  {intl.formatMessage({
                    id: 'TE4fIS',
                    defaultMessage: 'City',
                  })}
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="focus:border-kls-orange-primary focus:ring-kls-orange-accent w-full rounded-lg border border-gray-300 px-3 py-3 text-gray-900 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-4"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  {intl.formatMessage({
                    id: '3EnruA',
                    defaultMessage: 'Postal code',
                  })}
                </label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) =>
                    handleInputChange('postalCode', e.target.value)
                  }
                  className="focus:border-kls-orange-primary focus:ring-kls-orange-accent w-full rounded-lg border border-gray-300 px-3 py-3 text-gray-900 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-4"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  {intl.formatMessage({
                    id: 'vONi+O',
                    defaultMessage: 'Country',
                  })}
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="focus:border-kls-orange-primary focus:ring-kls-orange-accent w-full rounded-lg border border-gray-300 px-3 py-3 text-gray-900 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-4"
                >
                  <option value="CH">Switzerland</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="IT">Italy</option>
                  <option value="AT">Austria</option>
                  <option value="US">United States</option>
                  <option value="GB">United Kingdom</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <button
            type="submit"
            disabled={finalAmount <= 0 || isLoading}
            className={clsx(
              'w-full rounded-lg px-8 py-4 text-lg font-semibold transition-all duration-200 ease-in-out focus:outline-none focus:ring-4',
              finalAmount > 0 && !isLoading
                ? 'bg-kls-orange-primary focus:ring-kls-orange-accent text-white shadow-lg hover:bg-orange-600 hover:shadow-xl'
                : 'cursor-not-allowed bg-gray-300 text-gray-500',
            )}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <svg className="size-5 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>
                  {intl.formatMessage({
                    id: '6OWS4p',
                    defaultMessage: 'Processing...',
                  })}
                </span>
              </div>
            ) : finalAmount > 0 ? (
              `${ctaText || defaultCtaText} - CHF ${finalAmount.toFixed(2)}`
            ) : (
              ctaText || defaultCtaText
            )}
          </button>

          {/* Trust Indicators */}
          <div className="mt-6 flex items-center justify-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <LockIcon />
              <span>
                {intl.formatMessage({
                  id: 'mOSZ4T',
                  defaultMessage: 'Secure payment',
                })}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <HeartIcon />
              <span>
                {intl.formatMessage({
                  id: 'nwMvrl',
                  defaultMessage: '100% goes to the cause',
                })}
              </span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

// Icon Components
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
