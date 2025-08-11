'use client';
import { useIntl } from '@amazeelabs/react-intl';
import { CartQuery, Image } from '@custom/schema';
import { MinusIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import React from 'react';

import { useCart } from '../../stores/cart.store';
import { Price } from './Price';

type CartItemFromQuery = NonNullable<
  NonNullable<CartQuery['cart']>['items'][0]
>;

export interface CartItemProps {
  item: CartItemFromQuery;
  showImage?: boolean;
  compact?: boolean;
  onRemove?: (id: string) => void;
  onUpdateQuantity?: (id: string, quantity: number) => void;
}

export function CartItem({
  item,
  showImage = true,
  compact = false,
  onRemove,
  onUpdateQuantity,
}: CartItemProps) {
  const intl = useIntl();

  const { updateCartItem, removeFromCart } = useCart();

  const handleRemove = async () => {
    if (onRemove) {
      onRemove(item.id);
    } else {
      await removeFromCart(item.id);
    }
  };

  const handleQuantityChange = async (newQuantity: number) => {
    if (onUpdateQuantity) {
      onUpdateQuantity(item.id, newQuantity);
    } else {
      await updateCartItem(item.id, newQuantity);
    }
  };

  const handleDecrease = () => {
    if (item.quantity > 1) {
      handleQuantityChange(item.quantity - 1);
    } else {
      handleRemove();
    }
  };

  const handleIncrease = () => {
    if (item.quantity < item.maxStock) {
      handleQuantityChange(item.quantity + 1);
    }
  };

  const totalPrice = item.price * item.quantity;

  return (
    <div
      className={clsx(
        'flex gap-4',
        compact ? 'py-2' : 'py-4',
        !compact && 'border-b border-gray-200',
      )}
    >
      {showImage && item.teaserImage && (
        <div
          className={clsx(
            'shrink-0 overflow-hidden rounded-md',
            compact ? 'size-12' : 'size-20',
          )}
        >
          <Image {...item.teaserImage} className="size-full object-cover" />
        </div>
      )}

      <div className="flex flex-1 flex-col">
        <div className="flex justify-between">
          <div className="flex-1">
            <h3
              className={clsx(
                'font-medium text-gray-900',
                compact ? 'text-sm' : 'text-base',
              )}
            >
              {item.title}
            </h3>
            <p
              className={clsx('text-gray-500', compact ? 'text-xs' : 'text-sm')}
            >
              {intl.formatMessage(
                { id: 'im9OV5', defaultMessage: 'SKU: {sku}' },
                { sku: item.sku },
              )}
            </p>
          </div>

          <div className="flex flex-col items-end">
            <div
              className={clsx(
                'font-medium text-gray-900',
                compact ? 'text-sm' : 'text-base',
              )}
            >
              <Price amount={totalPrice} />
            </div>
            {!compact && (
              <div className="text-sm text-gray-500">
                <Price amount={item.price} />
                {intl.formatMessage({ id: 'HckLdl', defaultMessage: ' each' })}
              </div>
            )}
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={handleDecrease}
              className="flex size-8 items-center justify-center rounded-full hover:bg-gray-100 disabled:opacity-50"
              disabled={item.quantity <= 1}
              aria-label={intl.formatMessage({
                id: 'iL0n4U',
                defaultMessage: 'Decrease quantity',
              })}
            >
              <MinusIcon className="size-4" />
            </button>

            <span className="mx-2 min-w-8 text-center text-sm font-medium">
              {item.quantity}
            </span>

            <button
              onClick={handleIncrease}
              className="flex size-8 items-center justify-center rounded-full hover:bg-gray-100 disabled:opacity-50"
              disabled={item.quantity >= item.maxStock}
              aria-label={intl.formatMessage({
                id: '3ZPs5M',
                defaultMessage: 'Increase quantity',
              })}
            >
              <PlusIcon className="size-4" />
            </button>
          </div>

          <button
            onClick={handleRemove}
            className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800"
            aria-label={intl.formatMessage({
              id: '3dwSlf',
              defaultMessage: 'Remove item',
            })}
          >
            <TrashIcon className="size-4" />
            {!compact && (
              <span>
                {intl.formatMessage({ id: 'G/yZLu', defaultMessage: 'Remove' })}
              </span>
            )}
          </button>
        </div>

        {item.quantity >= item.maxStock && (
          <div className="mt-1 text-xs text-amber-600">
            {intl.formatMessage({
              id: 'EVsdht',
              defaultMessage: 'Maximum quantity reached',
            })}
          </div>
        )}
      </div>
    </div>
  );
}
