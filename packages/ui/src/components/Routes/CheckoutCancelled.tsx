import { useIntl } from '@amazeelabs/react-intl';
import { Url, useLocation } from '@custom/schema';
import { XCircleIcon } from '@heroicons/react/24/outline';
import React from 'react';

import { BreadCrumbs } from '../Molecules/Breadcrumbs';
import { PageTransition } from '../Molecules/PageTransition';

export function CheckoutCancelled() {
  const intl = useIntl();
  const [, navigate] = useLocation();

  const handleBackToCart = () => {
    navigate('/cart' as Url);
  };

  const handleContinueShopping = () => {
    navigate('/' as Url);
  };

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8">
        <BreadCrumbs />

        <div className="py-16 text-center">
          <XCircleIcon className="mx-auto size-16 text-orange-500" />

          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            {intl.formatMessage({
              id: 'Br8UKu',
              defaultMessage: 'Bezahlung abgebrochen',
            })}
          </h1>

          <div className="mx-auto mt-6 max-w-2xl">
            <p className="mb-4 text-gray-600">
              {intl.formatMessage({
                id: 'dAygBw',
                defaultMessage:
                  'Sie haben die Bezahlung abgebrochen. Ihre Bestellung wurde nicht abgeschlossen.',
              })}
            </p>

            <p className="mb-8 text-gray-600">
              {intl.formatMessage({
                id: 'Dr/Vlm',
                defaultMessage:
                  'Ihre Artikel befinden sich weiterhin im Warenkorb. Sie können den Bestellvorgang jederzeit erneut starten.',
              })}
            </p>
          </div>

          <div className="mt-8 space-y-4 sm:flex sm:justify-center sm:space-x-4 sm:space-y-0">
            <button
              onClick={handleBackToCart}
              className="bg-kls-orange-primary hover:bg-kls-orange-accessible inline-flex items-center rounded-full px-6 py-3 text-base font-medium text-white"
            >
              {intl.formatMessage({
                id: 'wy644A',
                defaultMessage: 'Zurück zum Warenkorb',
              })}
            </button>

            <button
              onClick={handleContinueShopping}
              className="text-kls-orange-primary hover:text-kls-orange-accent inline-flex items-center rounded-full px-6 py-3 text-base font-medium"
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
                  id: '7ltQHz',
                  defaultMessage:
                    'Bei Problemen beim Bezahlvorgang können Sie sich gerne an uns wenden:',
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
