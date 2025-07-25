import { useIntl } from '@amazeelabs/react-intl';
import { Url, useLocation } from '@custom/schema';
import React from 'react';

import { CartPage } from '../Organisms/CartPage';

export function Cart() {
  const [, navigate] = useLocation();
  const intl = useIntl();

  const handleContinueShopping = () => {
    const homeUrl =
      intl.locale === 'en' ? '/' : `/${intl.locale.replace('_', '-')}`;
    navigate(homeUrl as Url);
  };

  const handleCheckout = () => {
    const checkoutUrl =
      intl.locale === 'en' ? '/cart' : `/${intl.locale.replace('_', '-')}/cart`;
    navigate(checkoutUrl as Url);
  };

  return (
    <CartPage
      onContinueShopping={handleContinueShopping}
      onCheckout={handleCheckout}
      showBreadcrumbs={true}
    />
  );
}
