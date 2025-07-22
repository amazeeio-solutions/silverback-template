import { useIntl } from '@amazeelabs/react-intl';
import { Url, useLocation } from '@custom/schema';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import React from 'react';

import { BreadCrumbs } from '../Molecules/Breadcrumbs';
import { PageTransition } from '../Molecules/PageTransition';

export function CheckoutFailed() {
  const intl = useIntl();
  const [, navigate] = useLocation();

  const handleRetryCheckout = () => {
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
          <ExclamationTriangleIcon className="mx-auto size-16 text-red-500" />

          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            {intl.formatMessage({
              id: 'Ch3Jof',
              defaultMessage: 'Bezahlung fehlgeschlagen',
            })}
          </h1>

          <div className="mx-auto mt-6 max-w-2xl">
            <p className="mb-4 text-gray-600">
              {intl.formatMessage({
                id: 'dtDPta',
                defaultMessage:
                  'Bei der Bezahlung ist ein Fehler aufgetreten. Ihre Bestellung konnte nicht abgeschlossen werden.',
              })}
            </p>

            <p className="mb-8 text-gray-600">
              {intl.formatMessage({
                id: 'p/m+PQ',
                defaultMessage:
                  'Bitte versuchen Sie es erneut oder wenden Sie sich an unseren Kundendienst, falls das Problem weiterhin besteht.',
              })}
            </p>
          </div>

          <div className="mt-8 space-y-4 sm:flex sm:justify-center sm:space-x-4 sm:space-y-0">
            <button
              onClick={handleRetryCheckout}
              className="bg-kls-orange-primary hover:bg-kls-orange-accessible inline-flex items-center rounded-full px-6 py-3 text-base font-medium text-white"
            >
              {intl.formatMessage({
                id: 'ntg/tl',
                defaultMessage: 'Erneut versuchen',
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
            <div className="rounded-lg border border-red-200 bg-red-50 p-6">
              <h3 className="mb-4 text-lg font-medium text-red-900">
                {intl.formatMessage({
                  id: 'azbj20',
                  defaultMessage: 'Probleme mit der Bezahlung?',
                })}
              </h3>
              <p className="mb-4 text-sm text-red-700">
                {intl.formatMessage({
                  id: 'ox8v7v',
                  defaultMessage:
                    'Mögliche Ursachen: Unzureichende Deckung, Karte gesperrt, technische Probleme oder Zeitüberschreitung.',
                })}
              </p>
              <div className="mb-4 text-sm text-red-700">
                <p className="mb-2 font-medium">
                  {intl.formatMessage({
                    id: 'TzZDs2',
                    defaultMessage: 'Lösungsansätze:',
                  })}
                </p>
                <ul className="list-inside list-disc space-y-1">
                  <li>
                    {intl.formatMessage({
                      id: 'tEqYQZ',
                      defaultMessage: 'Überprüfen Sie Ihre Kartendaten',
                    })}
                  </li>
                  <li>
                    {intl.formatMessage({
                      id: '0CaVhb',
                      defaultMessage:
                        'Stellen Sie sicher, dass genügend Guthaben vorhanden ist',
                    })}
                  </li>
                  <li>
                    {intl.formatMessage({
                      id: 'mBcMib',
                      defaultMessage:
                        'Versuchen Sie eine andere Zahlungsmethode',
                    })}
                  </li>
                </ul>
              </div>
              <div className="border-t border-red-200 pt-4">
                <p className="mb-2 text-sm text-red-700">
                  {intl.formatMessage({
                    id: 'muU/9m',
                    defaultMessage:
                      'Bei weiteren Problemen kontaktieren Sie uns:',
                  })}
                </p>
                <div className="text-sm text-red-700">
                  <p className="mb-1">
                    <strong>
                      {intl.formatMessage({
                        id: 'obf+qn',
                        defaultMessage: 'Telefon:',
                      })}
                    </strong>{' '}
                    031 389 91 00
                  </p>
                  <p>
                    <strong>
                      {intl.formatMessage({
                        id: '4DjuuM',
                        defaultMessage: 'E-Mail:',
                      })}
                    </strong>{' '}
                    info@krebsliga.ch
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
