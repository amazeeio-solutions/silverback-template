'use client';
import { useIntl } from '@amazeelabs/react-intl';
import { CartQuery } from '@custom/schema';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import React from 'react';

import { useCart } from '../../stores/cart.store';
import { BreadCrumbs } from '../Molecules/Breadcrumbs';
import { CartItem } from '../Molecules/CartItem';
import { PageTransition } from '../Molecules/PageTransition';
import { Price } from '../Molecules/Price';

type CartItemFromQuery = NonNullable<
  NonNullable<CartQuery['cart']>['items'][0]
>;

export interface CartPageProps {
  onContinueShopping?: () => void;
  onCheckout?: () => void;
  showBreadcrumbs?: boolean;
}

export function CartPage({
  onContinueShopping,
  onCheckout,
  showBreadcrumbs = true,
}: CartPageProps) {
  const intl = useIntl();

  const { cart, error, clearCart } = useCart();

  const items = cart?.items || [];
  const totalItems = cart?.totalItems || 0;
  const totalPrice = cart?.totalPrice || 0;

  const handleClearCart = async () => {
    if (
      window.confirm(
        intl.formatMessage({
          id: 's9jGYQ',
          defaultMessage: 'Are you sure you want to clear your cart?',
        }),
      )
    ) {
      await clearCart();
    }
  };

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8">
        {showBreadcrumbs && <BreadCrumbs />}

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {intl.formatMessage({
              id: 'KFD6en',
              defaultMessage: 'Shopping Cart',
            })}
          </h1>
          {totalItems > 0 && (
            <p className="mt-2 text-sm text-gray-600">
              {intl.formatMessage(
                {
                  id: '2SyuVE',
                  defaultMessage: 'Shopping cart ({count} items)',
                },
                { count: totalItems },
              )}
            </p>
          )}
        </div>

        {items.length === 0 ? (
          <div className="py-16 text-center">
            <ShoppingBagIcon className="mx-auto size-16 text-gray-400" />
            <h2 className="mt-4 text-xl font-medium text-gray-900">
              {intl.formatMessage({
                id: 'TtTPxt',
                defaultMessage: 'Your cart is empty',
              })}
            </h2>
            <p className="mt-2 text-gray-500">
              {intl.formatMessage({
                id: 'ZiHD2h',
                defaultMessage: 'Start shopping to add items to your cart',
              })}
            </p>
            {onContinueShopping && (
              <button
                onClick={onContinueShopping}
                className="bg-kls-orange-primary hover:bg-kls-orange-accessible mt-6 inline-flex items-center rounded-full px-4 py-2 text-sm font-medium text-white"
              >
                {intl.formatMessage({
                  id: 'Yywm0p',
                  defaultMessage: 'Continue shopping',
                })}
              </button>
            )}
          </div>
        ) : (
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-8">
              <div className="rounded-lg bg-white shadow">
                <div className="px-4 py-6 sm:px-6">
                  <div className="flow-root">
                    <ul className="-my-6 divide-y divide-gray-200">
                      {items.map((item: CartItemFromQuery) => (
                        <li key={item.id} className="py-6">
                          <CartItem
                            item={item}
                            showImage={true}
                            compact={false}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Cart Actions */}
                <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={handleClearCart}
                      className="rounded-full px-4 py-2 text-sm font-medium text-red-600 hover:text-red-500"
                    >
                      {intl.formatMessage({
                        id: 'rYE5UO',
                        defaultMessage: 'Clear cart',
                      })}
                    </button>

                    {onContinueShopping && (
                      <button
                        onClick={onContinueShopping}
                        className="text-kls-orange-primary hover:text-kls-orange-accent rounded-full px-4 py-2 text-sm font-medium"
                      >
                        {intl.formatMessage({
                          id: 'Yywm0p',
                          defaultMessage: 'Continue shopping',
                        })}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-4">
              <div className="rounded-lg bg-white shadow">
                <div className="px-4 py-6 sm:px-6">
                  <h2 className="text-lg font-medium text-gray-900">
                    {intl.formatMessage({
                      id: 'SB//YQ',
                      defaultMessage: 'Order summary',
                    })}
                  </h2>

                  <div className="mt-6 space-y-4">
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

                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center justify-between">
                        <dt className="text-base font-medium text-gray-900">
                          {intl.formatMessage({
                            id: 'LN2GJk',
                            defaultMessage: 'Order total',
                          })}
                        </dt>
                        <dd className="text-base font-medium text-gray-900">
                          <Price amount={totalPrice} />
                        </dd>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    {onCheckout && (
                      <button
                        onClick={onCheckout}
                        className="bg-kls-orange-primary hover:bg-kls-orange-accessible focus:ring-kls-orange-accent w-full rounded-full px-4 py-3 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2"
                      >
                        {intl.formatMessage({
                          id: 'BJ2TKX',
                          defaultMessage: 'Checkout',
                        })}
                      </button>
                    )}
                  </div>

                  <div className="mt-6 text-center text-sm text-gray-500">
                    <p>
                      {intl.formatMessage({
                        id: 'iMxctw',
                        defaultMessage:
                          'Shipping and taxes calculated at checkout',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
