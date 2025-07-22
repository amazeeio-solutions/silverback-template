'use client';
import { useIntl } from '@amazeelabs/react-intl';
import { CheckoutMutation } from '@custom/schema';
import React from 'react';
import { useForm } from 'react-hook-form';

import { useMutation } from '../../utils/operation';
import { Messages } from '../Molecules/Messages';

export interface CheckoutFormData {
  // Contact Information
  emailAddress: string;

  // Billing Address
  firstName: string;
  lastName: string;
  company?: string;
  addressLine: string;
  postalCode: string;
  city: string;
  countryCode: string;

  // Meta Data
  donation: number; // in CHF (Swiss Francs)
}

export interface CheckoutFormProps {
  onSuccess?: (orderNumber: string) => void;
  onCancel?: () => void;
}

export function CheckoutForm({ onSuccess, onCancel }: CheckoutFormProps) {
  const intl = useIntl();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    defaultValues: {
      countryCode: 'CH',
      donation: 0,
    },
  });

  const { data, trigger, isMutating } = useMutation(CheckoutMutation);

  const errorMessages =
    !isMutating &&
    data &&
    data.checkout?.errors &&
    data.checkout.errors.length > 0
      ? data.checkout.errors.map((error) => error?.message || '')
      : null;

  const onSubmit = async (formData: CheckoutFormData) => {
    const result = await trigger({
      input: {
        contactInfo: {
          emailAddress: formData.emailAddress,
        },
        billingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          company: formData.company || undefined,
          addressLine: formData.addressLine,
          postalCode: formData.postalCode,
          city: formData.city,
          countryCode: formData.countryCode,
        },
        metaData: {
          donation: formData.donation,
        },
      },
    });

    if (result?.checkout?.paymentRedirectUrl) {
      // Paid checkout - redirect to payment provider
      window.location.href = result.checkout.paymentRedirectUrl;
    } else if (result?.checkout?.order?.orderNumber && onSuccess) {
      // Free checkout completed successfully
      onSuccess(result.checkout.order.orderNumber);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {errorMessages && <Messages messages={errorMessages} />}

        {/* Contact Information */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-6 text-lg font-semibold text-gray-900">
            {intl.formatMessage({
              id: 'RYiGdc',
              defaultMessage: 'Contact Information',
            })}
          </h2>

          <div>
            <label
              htmlFor="emailAddress"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              {intl.formatMessage({
                id: 'xxQxLE',
                defaultMessage: 'Email Address',
              })}
              <span className="ml-1 text-red-500">*</span>
            </label>
            <input
              type="email"
              id="emailAddress"
              {...register('emailAddress', {
                required: intl.formatMessage({
                  id: 'zEdCI3',
                  defaultMessage: 'Email address is required',
                }),
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: intl.formatMessage({
                    id: 'oLpv29',
                    defaultMessage: 'Please enter a valid email address',
                  }),
                },
              })}
              className="focus:border-kls-orange-primary focus:ring-kls-orange-primary block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
              placeholder={intl.formatMessage({
                id: 'VL/B6x',
                defaultMessage: 'your@email.com',
              })}
            />
            {errors.emailAddress && (
              <p className="mt-1 text-sm text-red-600">
                {errors.emailAddress.message}
              </p>
            )}
          </div>
        </div>

        {/* Billing Address */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-6 text-lg font-semibold text-gray-900">
            {intl.formatMessage({
              id: 'c7/79+',
              defaultMessage: 'Billing Address',
            })}
          </h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="firstName"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                {intl.formatMessage({
                  id: 'Q6wcZ5',
                  defaultMessage: 'First Name',
                })}
                <span className="ml-1 text-red-500">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                {...register('firstName', {
                  required: intl.formatMessage({
                    id: 'FZI5xl',
                    defaultMessage: 'First name is required',
                  }),
                })}
                className="focus:border-kls-orange-primary focus:ring-kls-orange-primary block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                {intl.formatMessage({
                  id: 'aheQdn',
                  defaultMessage: 'Last Name',
                })}
                <span className="ml-1 text-red-500">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                {...register('lastName', {
                  required: intl.formatMessage({
                    id: 'yos4hi',
                    defaultMessage: 'Last name is required',
                  }),
                })}
                className="focus:border-kls-orange-primary focus:ring-kls-orange-primary block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.lastName.message}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="company"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                {intl.formatMessage({
                  id: '9YazHG',
                  defaultMessage: 'Company',
                })}
                <span className="ml-1 text-gray-500">
                  (
                  {intl.formatMessage({
                    id: 'V4KNjk',
                    defaultMessage: 'optional',
                  })}
                  )
                </span>
              </label>
              <input
                type="text"
                id="company"
                {...register('company')}
                className="focus:border-kls-orange-primary focus:ring-kls-orange-primary block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="addressLine"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                {intl.formatMessage({
                  id: 'V5DGmb',
                  defaultMessage: 'Street Address',
                })}
                <span className="ml-1 text-red-500">*</span>
              </label>
              <input
                type="text"
                id="addressLine"
                {...register('addressLine', {
                  required: intl.formatMessage({
                    id: '+x5KCt',
                    defaultMessage: 'Street address is required',
                  }),
                })}
                className="focus:border-kls-orange-primary focus:ring-kls-orange-primary block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
              />
              {errors.addressLine && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.addressLine.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="postalCode"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                {intl.formatMessage({
                  id: 'UqKMjl',
                  defaultMessage: 'Postal Code',
                })}
                <span className="ml-1 text-red-500">*</span>
              </label>
              <input
                type="text"
                id="postalCode"
                {...register('postalCode', {
                  required: intl.formatMessage({
                    id: '15CNak',
                    defaultMessage: 'Postal code is required',
                  }),
                })}
                className="focus:border-kls-orange-primary focus:ring-kls-orange-primary block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
              />
              {errors.postalCode && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.postalCode.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="city"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                {intl.formatMessage({
                  id: 'TE4fIS',
                  defaultMessage: 'City',
                })}
                <span className="ml-1 text-red-500">*</span>
              </label>
              <input
                type="text"
                id="city"
                {...register('city', {
                  required: intl.formatMessage({
                    id: 'W435jR',
                    defaultMessage: 'City is required',
                  }),
                })}
                className="focus:border-kls-orange-primary focus:ring-kls-orange-primary block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.city.message}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="countryCode"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                {intl.formatMessage({
                  id: 'vONi+O',
                  defaultMessage: 'Country',
                })}
                <span className="ml-1 text-red-500">*</span>
              </label>
              <select
                id="countryCode"
                {...register('countryCode', {
                  required: intl.formatMessage({
                    id: 'jlqOPq',
                    defaultMessage: 'Country is required',
                  }),
                })}
                className="focus:border-kls-orange-primary focus:ring-kls-orange-primary block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
              >
                <option value="CH">🇨🇭 Switzerland</option>
                <option value="DE">🇩🇪 Germany</option>
                <option value="AT">🇦🇹 Austria</option>
                <option value="FR">🇫🇷 France</option>
                <option value="IT">🇮🇹 Italy</option>
                <option value="US">🇺🇸 United States</option>
                <option value="GB">🇬🇧 United Kingdom</option>
              </select>
              {errors.countryCode && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.countryCode.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Donation */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-6 text-lg font-semibold text-gray-900">
            {intl.formatMessage({
              id: 'ABZjGf',
              defaultMessage: 'Donation',
            })}
          </h2>

          <div>
            <label
              htmlFor="donation"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              {intl.formatMessage({
                id: 'osPC9b',
                defaultMessage: 'Donation Amount (in CHF)',
              })}
            </label>
            <div className="relative">
              <input
                type="number"
                id="donation"
                min="0"
                step="0.01"
                {...register('donation', {
                  min: {
                    value: 0,
                    message: intl.formatMessage({
                      id: 'U8UWDl',
                      defaultMessage: 'Donation amount must be 0 or greater',
                    }),
                  },
                  valueAsNumber: true,
                })}
                className="focus:border-kls-orange-primary focus:ring-kls-orange-primary block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                placeholder="0.00"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-gray-500 sm:text-sm">CHF</span>
              </div>
            </div>
            {errors.donation && (
              <p className="mt-1 text-sm text-red-600">
                {errors.donation.message}
              </p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              {intl.formatMessage({
                id: 'qDTmti',
                defaultMessage: 'Enter amount in Swiss Francs (CHF)',
              })}
            </p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="focus:ring-kls-orange-primary rounded-md border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              {intl.formatMessage({
                id: '47FYwb',
                defaultMessage: 'Cancel',
              })}
            </button>
          )}
          <button
            type="submit"
            disabled={isMutating}
            className="bg-kls-orange-primary hover:bg-kls-orange-accessible focus:ring-kls-orange-primary rounded-md border border-transparent px-6 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isMutating ? (
              <div className="flex items-center">
                <svg
                  className="-ml-1 mr-2 h-4 w-4 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {intl.formatMessage({
                  id: '6OWS4p',
                  defaultMessage: 'Processing...',
                })}
              </div>
            ) : (
              intl.formatMessage({
                id: '5PfBLL',
                defaultMessage: 'Complete Order',
              })
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
