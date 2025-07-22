import { useIntl } from '@amazeelabs/react-intl';
import { CartQuery, Url, useLocation } from '@custom/schema';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import React from 'react';

import { useOperation } from '../../utils/operation';
import { BreadCrumbs } from '../Molecules/Breadcrumbs';
import { PageTransition } from '../Molecules/PageTransition';
import { Price } from '../Molecules/Price';
import { CheckoutForm } from '../Organisms/CheckoutForm';

export function Checkout() {
  const intl = useIntl();
  const [location, navigate] = useLocation();
  const { data: cart } = useOperation(CartQuery);

  const items = cart?.cart?.items || [];
  const totalItems = cart?.cart?.totalItems || 0;
  const totalPrice = cart?.cart?.totalPrice || 0;

  // Check for URL parameters to handle payment provider redirects
  const urlParams = new URLSearchParams(location.search);
  const paymentStatus = urlParams.get('status');
  const orderNumber = urlParams.get('orderNumber');

  // Handle payment provider redirects
  React.useEffect(() => {
    if (paymentStatus === 'success' && orderNumber) {
      navigate(`/checkout/success?orderNumber=${orderNumber}` as Url);
    } else if (paymentStatus === 'cancelled') {
      navigate('/checkout/cancelled' as Url);
    } else if (paymentStatus === 'failed') {
      navigate('/checkout/failed' as Url);
    }
  }, [paymentStatus, orderNumber, navigate]);

  const handleCancel = () => {
    navigate('/cart' as Url);
  };

  const handleSuccess = (orderNumber: string) => {
    navigate(`/checkout/success?orderNumber=${orderNumber}` as Url);
  };

  // If cart is empty, redirect to cart page
  if (items.length === 0) {
    return (
      <PageTransition>
        <div className="container mx-auto px-4 py-8">
          <BreadCrumbs />

          <div className="py-16 text-center">
            <ShoppingBagIcon className="mx-auto size-16 text-gray-400" />
            <h1 className="mt-4 text-2xl font-bold text-gray-900">
              {intl.formatMessage({
                id: 'TtTPxt',
                defaultMessage: 'Your cart is empty',
              })}
            </h1>
            <p className="mt-2 text-gray-500">
              {intl.formatMessage({
                id: '4E2abB',
                defaultMessage:
                  'Add items to your cart before proceeding to checkout',
              })}
            </p>
            <button
              onClick={() => navigate('/' as Url)}
              className="bg-kls-orange-primary hover:bg-kls-orange-accessible mt-6 inline-flex items-center rounded-full px-4 py-2 text-sm font-medium text-white"
            >
              {intl.formatMessage({
                id: 'IUXVjJ',
                defaultMessage: 'Continue Shopping',
              })}
            </button>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8">
        <BreadCrumbs />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {intl.formatMessage({
              id: 'BJ2TKX',
              defaultMessage: 'Checkout',
            })}
          </h1>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-8">
            <CheckoutForm onSuccess={handleSuccess} onCancel={handleCancel} />
          </div>

          {/* Order Summary */}
          <div className="mt-8 lg:col-span-4 lg:mt-0">
            <div className="sticky top-8 rounded-lg bg-white shadow">
              <div className="px-4 py-6 sm:px-6">
                <h2 className="text-lg font-medium text-gray-900">
                  {intl.formatMessage({
                    id: 'ivNR8s',
                    defaultMessage: 'Order Summary',
                  })}
                </h2>

                {/* Cart Items */}
                <div className="mt-6 space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-start space-x-4">
                      {item.teaserImage && (
                        <img
                          src={item.teaserImage.source}
                          alt={item.teaserImage.alt || item.title}
                          className="size-16 rounded-md object-cover"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-medium text-gray-900">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {intl.formatMessage(
                            {
                              id: 'sHZWgK',
                              defaultMessage: 'Qty: {quantity}',
                            },
                            { quantity: item.quantity },
                          )}
                        </p>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        <Price amount={item.price * item.quantity} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Totals */}
                <div className="mt-6 space-y-4 border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-gray-600">
                      {intl.formatMessage({
                        id: 'L8seEc',
                        defaultMessage: 'Subtotal',
                      })}
                    </dt>
                    <dd className="text-sm font-medium text-gray-900">
                      <Price amount={totalPrice} />
                    </dd>
                  </div>

                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-gray-600">
                      {intl.formatMessage({
                        id: 'yNmV/R',
                        defaultMessage: 'Items',
                      })}
                    </dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {totalItems}
                    </dd>
                  </div>

                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-gray-600">
                      {intl.formatMessage({
                        id: 'PRlD0A',
                        defaultMessage: 'Shipping',
                      })}
                    </dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {intl.formatMessage({
                        id: 'tf1lIh',
                        defaultMessage: 'Free',
                      })}
                    </dd>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                    <dt className="text-base font-medium text-gray-900">
                      {intl.formatMessage({
                        id: '7PMLfK',
                        defaultMessage: 'Order Total',
                      })}
                    </dt>
                    <dd className="text-base font-medium text-gray-900">
                      <Price amount={totalPrice} />
                    </dd>
                  </div>
                </div>

                <div className="mt-6 text-center text-sm text-gray-500">
                  <p>
                    {intl.formatMessage({
                      id: 'hNIlUG',
                      defaultMessage:
                        'Your payment information is secure and encrypted',
                    })}
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
