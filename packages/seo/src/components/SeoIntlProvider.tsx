'use client';
import { IntlProvider } from '@amazeelabs/react-intl';
import { PropsWithChildren } from 'react';

const messages = {
  en: {
    'seo.aria.panel': 'SEO Analysis Panel',
    'seo.heading.results': 'SEO Analysis Results',
    'seo.heading.analysis': 'SEO Analysis',
    'seo.score.status.good': 'GOOD',
    'seo.score.status.ok': 'OK',
    'seo.score.status.poor': 'POOR',
    'seo.score.explanation': `SEO Scoring Guide:
• 0/10: Critical errors or broken content
• 3/10: Missing recommended elements (needs improvement)
• 6/10: Meets basic requirements
• 8-10/10: Excellent optimization`,
    'seo.button.close': 'Close SEO Analysis',
    'seo.button.open': 'Open SEO Analysis',
  },
  de: {
    'seo.aria.panel': 'SEO-Analyse-Panel',
    'seo.heading.results': 'SEO-Analyse Ergebnisse',
    'seo.heading.analysis': 'SEO-Analyse',
    'seo.score.status.good': 'GUT',
    'seo.score.status.ok': 'OK',
    'seo.score.status.poor': 'SCHLECHT',
    'seo.score.explanation': `SEO-Bewertungsrichtlinie:
• 0/10: Kritische Fehler oder defekte Inhalte
• 3/10: Fehlende empfohlene Elemente (verbesserungsbedürftig)
• 6/10: Erfüllt die Grundanforderungen
• 8-10/10: Ausgezeichnete Optimierung`,
    'seo.button.close': 'SEO-Analyse schließen',
    'seo.button.open': 'SEO-Analyse öffnen',
  },
  fr: {
    'seo.aria.panel': "Panneau d'analyse SEO",
    'seo.heading.results': "Résultats de l'analyse SEO",
    'seo.heading.analysis': 'Analyse SEO',
    'seo.score.status.good': 'BON',
    'seo.score.status.ok': 'OK',
    'seo.score.status.poor': 'FAIBLE',
    'seo.score.explanation': `Guide de notation SEO :
• 0/10 : Erreurs critiques ou contenu défectueux
• 3/10 : Éléments recommandés manquants (à améliorer)
• 6/10 : Répond aux exigences de base
• 8-10/10 : Optimisation excellente`,
    'seo.button.close': "Fermer l'analyse SEO",
    'seo.button.open': "Ouvrir l'analyse SEO",
  },
  it: {
    'seo.aria.panel': 'Pannello analisi SEO',
    'seo.heading.results': 'Risultati analisi SEO',
    'seo.heading.analysis': 'Analisi SEO',
    'seo.score.status.good': 'BUONO',
    'seo.score.status.ok': 'OK',
    'seo.score.status.poor': 'SCARSO',
    'seo.score.explanation': `Guida al punteggio SEO:
• 0/10: Errori critici o contenuto danneggiato
• 3/10: Elementi consigliati mancanti (necessita miglioramenti)
• 6/10: Soddisfa i requisiti di base
• 8-10/10: Ottimizzazione eccellente`,
    'seo.button.close': 'Chiudi analisi SEO',
    'seo.button.open': 'Apri analisi SEO',
  },
};

export function SeoIntlProvider({
  children,
  locale = 'en',
}: PropsWithChildren<{ locale?: string }>) {
  return (
    <IntlProvider messages={messages[locale] || messages['en']} locale={locale}>
      {children}
    </IntlProvider>
  );
}
