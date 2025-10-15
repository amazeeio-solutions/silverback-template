import type { Config } from 'tailwindcss';

export default {
  prefix: 'seo-',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
  variants: {
    extend: {
      visibility: ['group-hover'],
    },
  },
} satisfies Config;
