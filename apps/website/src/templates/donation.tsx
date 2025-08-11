import { Donation } from '@custom/ui/routes/Donation';
import { HeadProps } from 'gatsby';
import React from 'react';

const donationPageTitles = {
  en: 'Make a Donation - Support Our Cause',
  de: 'Spenden - Unterstützen Sie unsere Sache',
  it: 'Dona - Sostieni la nostra causa',
  fr: 'Faire un don - Soutenez notre cause',
};

const donationPageDescriptions = {
  en: 'Make a secure donation to support our important work. Every contribution makes a difference.',
  de: 'Spenden Sie sicher, um unsere wichtige Arbeit zu unterstützen. Jeder Beitrag macht einen Unterschied.',
  it: 'Fai una donazione sicura per sostenere il nostro importante lavoro. Ogni contributo fa la differenza.',
  fr: 'Faites un don sécurisé pour soutenir notre travail important. Chaque contribution fait la différence.',
};

export function Head({ location }: HeadProps) {
  // Extract language from pathname
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const language =
    pathSegments[0] === 'en' ||
    pathSegments[0] === 'de' ||
    pathSegments[0] === 'it' ||
    pathSegments[0] === 'fr'
      ? (pathSegments[0] as keyof typeof donationPageTitles)
      : 'en';

  const title = donationPageTitles[language];
  const description = donationPageDescriptions[language];

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </>
  );
}

export default function DonationTemplate() {
  return <Donation />;
}
