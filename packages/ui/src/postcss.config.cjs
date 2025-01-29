/* eslint-disable @typescript-eslint/no-require-imports */

module.exports = {
  plugins: {
    'postcss-import-ext-glob': {},
    'postcss-import': {},
    'tailwindcss/nesting': 'postcss-nested',
    tailwindcss: require('./tailwind.config.cjs'),
    autoprefixer: {},
    'postcss-prefix-selector': {
      prefix:
        {
          gutenberg:
            '.gutenberg__editor .edit-post-visual-editor__content-area',
        }[process.env.PREFIX] || '',
      skipGlobalSelectors: true,
    },
  },
};
