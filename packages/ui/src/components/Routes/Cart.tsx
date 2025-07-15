import { Url, useLocation } from '@custom/schema';
import React from 'react';

import { CartPage } from '../Organisms/CartPage';

export function Cart() {
  const [, navigate] = useLocation();

  const handleContinueShopping = () => {
    navigate('/' as Url);
  };

  const handleCheckout = () => {
    // TODO: Implement checkout functionality
    console.log('Checkout functionality to be implemented');
  };

  return (
    <CartPage
      onContinueShopping={handleContinueShopping}
      onCheckout={handleCheckout}
      showBreadcrumbs={true}
    />
  );
}
