/* eslint-disable @typescript-eslint/no-require-imports */

/** @type {import('tailwindcss').Config} */
const stylingAssets = require('./stylingAssets.json');

module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    '../../apps/preview/src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      typography: ({ theme }) => ({
        DEFAULT: {
          css: [
            {
              'a, p a': {},
              'ul, ol': {
                fontSize: '1.125rem',
                lineHeight: '1.688rem',
                paddingLeft: '2.5rem',
              },
              'ul>li::marker, ol>li::marker': {},
              strong: {
                color: theme('colors.gray.900'),
                fontWeight: '700',
              },
              '.prose p': {
                color: theme('colors.gray.500'),
                fontSize: '1.125rem',
                lineHeight: '1.688rem',
              },
              '.prose a, .prose p a': {
                color: theme('colors.blue.600'),
                fontWeight: '400',
              },
              '.prose em': {
                color: theme('colors.gray.900'),
              },
              'prose marker': {
                fontWeight: '700',
              },
              blockquote: {},
              '.prose blockquote p': {
                fontWeight: '700',
                color: '#111928',
              },
              cite: {},
              'h1, h2, h3, h4, h5, h6': {},
              '.prose h1': {},
              '.prose h2': {
                fontWeight: '700',
                color: theme('colors.gray.900'),
              },
              '.prose h3': {},
              '.prose h4': {},
            },
          ],
        },
      }),
    },
    ...stylingAssets.theme,
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/typography'),
  ],
};
