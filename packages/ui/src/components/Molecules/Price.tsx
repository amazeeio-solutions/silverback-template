import { useIntl } from '@amazeelabs/react-intl';
import React from 'react';

export interface PriceProps {
  /**
   * The numeric price value in Swiss Francs (CHF)
   */
  amount: number;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Price component that formats Swiss Francs (CHF) using react-intl.
 * Automatically handles currency symbols and locale-specific formatting.
 */
export const Price: React.FC<PriceProps> = ({ amount, className }) => {
  const intl = useIntl();

  const formattedPrice = intl.formatNumber(amount, {
    style: 'currency',
    currency: 'CHF',
  });

  return <span className={className}>{formattedPrice}</span>;
};
