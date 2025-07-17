'use client';
import { useIntl } from '@amazeelabs/react-intl';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import React, { useEffect, useRef } from 'react';

import { useCartStore } from '../../stores/cart';
import { CartItem } from '../Molecules/CartItem';
import { Price } from '../Molecules/Price';

export interface MiniCartProps {
  isOpen: boolean;
  onClose: () => void;
  onViewCart: () => void;
  onCheckout?: () => void;
}

export function MiniCart({
  isOpen,
  onClose,
  onViewCart,
  onCheckout,
}: MiniCartProps) {
  const intl = useIntl();
  const { items, getTotalItems, getTotalPrice } = useCartStore();
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();
  const miniCartRef = useRef<HTMLDivElement>(null);

  // Close mini cart when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        miniCartRef.current &&
        !miniCartRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Close mini cart on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black bg-opacity-25" />

      {/* Mini Cart */}
      <div
        ref={miniCartRef}
        className={clsx(
          'fixed right-0 top-0 z-50 size-full max-w-md bg-white shadow-xl transition-transform duration-300 ease-in-out',
          '',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 p-4">
            <h2 className="text-lg font-medium text-gray-900">
              {intl.formatMessage(
                {
                  id: '2SyuVE',
                  defaultMessage: 'Shopping cart ({count} items)',
                },
                { count: totalItems },
              )}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 rounded-full p-2"
              aria-label={intl.formatMessage({
                id: 'zLqIXZ',
                defaultMessage: 'Close cart',
              })}
            >
              <span className="sr-only">
                {intl.formatMessage({
                  id: 'zLqIXZ',
                  defaultMessage: 'Close cart',
                })}
              </span>
              <svg
                className="size-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <ShoppingBagIcon className="size-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {intl.formatMessage({
                    id: 'TtTPxt',
                    defaultMessage: 'Your cart is empty',
                  })}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {intl.formatMessage({
                    id: 'ZiHD2h',
                    defaultMessage: 'Start shopping to add items to your cart',
                  })}
                </p>
              </div>
            ) : (
              <div className="p-4">
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    compact={true}
                    showImage={true}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 p-4">
              <div className="flex justify-between text-base font-medium text-gray-900">
                <p>
                  {intl.formatMessage({
                    id: 'L8seEc',
                    defaultMessage: 'Subtotal',
                  })}
                </p>
                <p>
                  <Price amount={totalPrice} />
                </p>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {intl.formatMessage({
                  id: 'iMxctw',
                  defaultMessage: 'Shipping and taxes calculated at checkout',
                })}
              </p>

              <div className="mt-4 space-y-2">
                <button
                  onClick={onViewCart}
                  className="w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
                >
                  {intl.formatMessage({
                    id: '5Mx9oZ',
                    defaultMessage: 'View cart',
                  })}
                </button>

                {onCheckout && (
                  <button
                    onClick={onCheckout}
                    className="bg-kls-orange-primary hover:bg-kls-orange-accessible w-full rounded-full px-4 py-2 text-sm font-medium text-white"
                  >
                    {intl.formatMessage({
                      id: 'BJ2TKX',
                      defaultMessage: 'Checkout',
                    })}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
