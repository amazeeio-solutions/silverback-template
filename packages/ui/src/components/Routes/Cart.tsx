import { useIntl } from '@amazeelabs/react-intl';
import { Url, useLocation } from '@custom/schema';
import React from 'react';

import { CartPage } from '../Organisms/CartPage';

export function Cart() {
  const [, navigate] = useLocation();
  const intl = useIntl();

  const handleContinueShopping = () => {
    const localePrefix =
      intl.locale === 'french' ? 'french' : intl.locale.replace('_', '-');
    const homeUrl = `/${localePrefix}`;
    navigate(homeUrl as Url);
  };

  const handleCheckout = () => {
    const localePrefix =
      intl.locale === 'french' ? 'french' : intl.locale.replace('_', '-');
    const checkoutUrl = `/${localePrefix}/checkout`;
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
