'use client';
import React, { useEffect, useState } from 'react';

import { CartPage, CartPageProps } from '../Organisms/CartPage';
import { CartErrorBoundary } from './CartErrorBoundary';

/**
 * Client-only wrapper for CartPage to prevent SSR rendering
 */
export function ClientOnlyCartPage(props: CartPageProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // Show loading skeleton or placeholder during SSR/hydration
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="mb-2 h-8 w-48 animate-pulse rounded bg-gray-200"></div>
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
        </div>
        <div className="py-16 text-center">
          <div className="mx-auto h-16 w-16 animate-pulse rounded bg-gray-200"></div>
          <div className="mx-auto mt-4 h-6 w-48 animate-pulse rounded bg-gray-200"></div>
          <div className="mx-auto mt-2 h-4 w-64 animate-pulse rounded bg-gray-200"></div>
        </div>
      </div>
    );
  }

  return (
    <CartErrorBoundary>
      <CartPage {...props} />
    </CartErrorBoundary>
  );
}
