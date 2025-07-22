import { useIntl } from '@amazeelabs/react-intl';
import { Url, useLocation } from '@custom/schema';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import React from 'react';

import { BreadCrumbs } from '../Molecules/Breadcrumbs';
import { PageTransition } from '../Molecules/PageTransition';

export function CheckoutSuccess() {
  const intl = useIntl();
  const [location, navigate] = useLocation();

  // Extract order number from URL parameters
  const urlParams = new URLSearchParams(location.search);
  const orderNumber = urlParams.get('orderNumber');

  const handleContinueShopping = () => {
    navigate('/' as Url);
  };

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8">
        <BreadCrumbs />

        <div className="py-16 text-center">
          <CheckCircleIcon className="mx-auto size-16 text-green-600" />

          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            {intl.formatMessage({
              id: 'ln9/tK',
              defaultMessage: 'Bestellung erfolgreich!',
            })}
          </h1>

          {orderNumber && (
            <p className="mt-4 text-lg text-gray-600">
              {intl.formatMessage(
                {
                  id: 'Zrmxfi',
                  defaultMessage: 'Bestellnummer: {order_number}',
                },
                { order_number: orderNumber },
              )}
            </p>
          )}

          <div className="mx-auto mt-6 max-w-2xl">
            <p className="mb-4 text-gray-600">
              {intl.formatMessage({
                id: '8BLKpZ',
                defaultMessage:
                  'Vielen Dank für Ihre Bestellung und Spende! Sie erhalten in Kürze eine Bestätigungs-E-Mail mit Ihrer Spendenbescheinigung.',
              })}
            </p>

            <p className="mb-8 text-gray-600">
              {intl.formatMessage({
                id: 'DUP9Ew',
                defaultMessage:
                  'Ihre Spendenbescheinigung können Sie bei der Steuererklärung als Abzug geltend machen.',
              })}
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <button
              onClick={handleContinueShopping}
              className="bg-kls-orange-primary hover:bg-kls-orange-accessible inline-flex items-center rounded-full px-6 py-3 text-base font-medium text-white"
            >
              {intl.formatMessage({
                id: 'xOzBN1',
                defaultMessage: 'Weiter einkaufen',
              })}
            </button>
          </div>

          <div className="mx-auto mt-12 max-w-md">
            <div className="rounded-lg bg-gray-50 p-6">
              <h3 className="mb-4 text-lg font-medium text-gray-900">
                {intl.formatMessage({
                  id: 'Ks/5fw',
                  defaultMessage: 'Haben Sie Fragen?',
                })}
              </h3>
              <p className="mb-3 text-sm text-gray-600">
                {intl.formatMessage({
                  id: '/o8pJX',
                  defaultMessage: 'Unser Team steht Ihnen gerne zur Verfügung:',
                })}
              </p>
              <div className="text-sm text-gray-600">
                <p className="mb-1">
                  <strong>
                    {intl.formatMessage({
                      id: 'obf+qn',
                      defaultMessage: 'Telefon:',
                    })}
                  </strong>{' '}
                  031 389 91 00
                </p>
                <p className="mb-1">
                  <strong>
                    {intl.formatMessage({
                      id: '4DjuuM',
                      defaultMessage: 'E-Mail:',
                    })}
                  </strong>{' '}
                  info@krebsliga.ch
                </p>
                <p>
                  <strong>
                    {intl.formatMessage({
                      id: 'HbHNHw',
                      defaultMessage: 'Mo-Fr:',
                    })}
                  </strong>{' '}
                  9:00 - 16:00 Uhr
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
