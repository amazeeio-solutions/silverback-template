'use client';
import React, { useEffect, useState } from 'react';

import { MiniCart, MiniCartProps } from '../Organisms/MiniCart';

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

  return <MiniCart {...props} />;
}
