import { useLocation, ViewProductQuery } from '@custom/schema';
import React from 'react';

import { isTruthy } from '../../utils/isTruthy';
import { Translations } from '../../utils/translations';
import { withOperation } from '../../utils/with-operation';
import { ProductDisplay } from '../Organisms/ProductDisplay';

export const ProductWithData = withOperation(ViewProductQuery, (result) => {
  // Initialize the language switcher with the options this product has.
  const translations = Object.fromEntries(
    result?.product?.translations
      ?.filter(isTruthy)
      .map((translation) => [translation.locale, translation.path]) || [],
  );
  return result?.product ? (
    <Translations translations={translations}>
      <ProductDisplay {...result.product} />
    </Translations>
  ) : null;
});

export function Product() {
  // Retrieve the current location and load the product
  // behind it.
  const [loc] = useLocation();
  return <ProductWithData pathname={loc.pathname} />;
}
