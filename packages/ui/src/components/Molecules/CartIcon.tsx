'use client';
import { useIntl } from '@amazeelabs/react-intl';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import React from 'react';

import { useCartStore } from '../../stores/cart';

export interface CartIconProps {
  className?: string;
  onClick?: () => void;
  showBadge?: boolean;
}

export function CartIcon({
  className,
  onClick,
  showBadge = true,
}: CartIconProps) {
  const intl = useIntl();
  const { getTotalItems } = useCartStore();
  const totalItems = getTotalItems();

  return (
    <button
      onClick={onClick}
      className={clsx(
        'relative flex items-center justify-center p-2 transition-colors hover:bg-gray-100',
        className,
      )}
      aria-label={intl.formatMessage(
        { id: '2SyuVE', defaultMessage: 'Shopping cart ({count} items)' },
        { count: totalItems },
      )}
    >
      <ShoppingBagIcon className="size-6" />
      {showBadge && totalItems > 0 && (
        <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </button>
  );
}
