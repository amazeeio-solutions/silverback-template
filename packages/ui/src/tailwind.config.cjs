/* eslint-disable @typescript-eslint/no-require-imports */

/** @type {import('tailwindcss').Config} */
const stylingAssets = require('./stylingAssets.json');

module.exports = {
  content: ['./src/**/*.{tsx, mdx}'],
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
                color: theme('colors.gray.dark'),
                fontWeight: '700',
                fontFamily: theme('fontFamily.open-sans'),
              },
              '.prose p': {
                color: theme('colors.gray.DEFAULT'),
                fontSize: '1.125rem',
                lineHeight: '1.688rem',
                fontFamily: theme('fontFamily.open-sans'),
              },
              '.prose a, .prose p a': {
                color: theme('colors.kls.orange.primary'),
                fontWeight: '400',
                fontFamily: theme('fontFamily.open-sans'),
              },
              '.prose em': {
                color: theme('colors.gray.dark'),
                fontFamily: theme('fontFamily.open-sans'),
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
    function ({ addUtilities }) {
      const newUtilities = {
        '.headline-1': {
          fontFamily: '"Open Sans", sans-serif',
          fontSize: '40px',
          fontWeight: '800',
          lineHeight: '1.25',
        },
        '.headline-2': {
          fontFamily: '"Open Sans", sans-serif',
          fontSize: '30px',
          fontWeight: '800',
          lineHeight: '1.25',
        },
        '.headline-3': {
          fontFamily: '"Open Sans", sans-serif',
          fontSize: '26px',
          fontWeight: '700',
          lineHeight: '1.25',
        },
        '.headline-4': {
          fontFamily: '"Open Sans", sans-serif',
          fontSize: '22px',
          fontWeight: '700',
          lineHeight: '1.25',
        },
        '.headline-5': {
          fontFamily: '"Open Sans", sans-serif',
          fontSize: '18px',
          fontWeight: '700',
          lineHeight: '1.25',
        },
        '.lead-text': {
          fontFamily: '"Open Sans", sans-serif',
          fontSize: '22px',
          fontWeight: '400',
          lineHeight: '1.5',
        },
        '.copy-bold': {
          fontFamily: '"Open Sans", sans-serif',
          fontSize: '18px',
          fontWeight: '700',
          lineHeight: '1.6',
        },
        '.copy-regular': {
          fontFamily: '"Open Sans", sans-serif',
          fontSize: '18px',
          fontWeight: '400',
          lineHeight: '1.6',
        },
        '.copy-medium-bold': {
          fontFamily: '"Open Sans", sans-serif',
          fontSize: '16px',
          fontWeight: '700',
          lineHeight: '1.6',
        },
        '.copy-medium': {
          fontFamily: '"Open Sans", sans-serif',
          fontSize: '16px',
          fontWeight: '400',
          lineHeight: '1.6',
        },
        '.copy-small': {
          fontFamily: '"Open Sans", sans-serif',
          fontSize: '14px',
          fontWeight: '400',
          lineHeight: '1.6',
        },
      };
      addUtilities(newUtilities);
    },
  ],
};
