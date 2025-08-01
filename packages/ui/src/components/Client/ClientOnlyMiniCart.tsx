'use client';
import React, { useEffect, useState } from 'react';

import { MiniCart, MiniCartProps } from '../Organisms/MiniCart';
import { CartErrorBoundary } from './CartErrorBoundary';

/**
 * Client-only wrapper for MiniCart to prevent SSR rendering
 */
export function ClientOnlyMiniCart(props: MiniCartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <CartErrorBoundary
      fallback={
        <div className="fixed inset-0 z-40 bg-black bg-opacity-25">
          <div className="fixed right-0 top-0 z-50 size-full max-w-md bg-white p-4 shadow-xl">
            <div className="text-center">
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                Cart Error
              </h3>
              <p className="text-sm text-gray-600">
                Unable to load cart. Please refresh the page.
              </p>
            </div>
          </div>
        </div>
      }
    >
      <MiniCart {...props} />
    </CartErrorBoundary>
  );
}
