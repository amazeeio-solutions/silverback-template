import { Locale, useLocation } from '@custom/schema';
import React from 'react';

import { Translations } from '../../utils/translations';
import { PageTransition } from '../Molecules/PageTransition';
import { DonationForm } from '../Organisms/DonationForm';

export function Donation() {
  const [location] = useLocation();

  // Extract amount parameter from URL
  const searchParams = new URLSearchParams(location.search);
  const preselectedAmount = searchParams.get('amount') || undefined;

  // Create translation paths for language switcher
  const translations = Object.fromEntries(
    Object.values(Locale).map((locale) => {
      const localeStr = locale === 'french' ? 'fr' : locale.replace('_', '-');
      return [locale, `/${localeStr}/donate`];
    }),
  );

  return (
    <PageTransition>
      <Translations translations={translations}>
        <main className="min-h-screen bg-gray-50 py-12">
          <div className="mx-auto max-w-4xl px-4">
            <div className="rounded-lg bg-white p-8 shadow-lg">
              <DonationForm preselectedAmount={preselectedAmount} />
            </div>
          </div>
        </main>
      </Translations>
    </PageTransition>
  );
}
