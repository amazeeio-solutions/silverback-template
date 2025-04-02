import type { StorybookConfig } from '@storybook/react-vite';
import { readdirSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { mergeConfig, UserConfig } from 'vite';
import { imagetools } from 'vite-imagetools';

const fonts = readdirSync(`static/public/fonts/preload`).map((font) => {
  return `/fonts/preload/${font}`;
});

const config: StorybookConfig = {
  viteFinal: (config) =>
    mergeConfig(config, {
      css: {
        postcss: 'src',
      },
      resolve: {
        alias: {
          '@amazeelabs/bridge': '@amazeelabs/bridge-storybook',
          '@stories': resolve(
            dirname(
              new URL(
                // @ts-expect-error It works.
                import.meta.url,
              ).pathname,
            ),
            '../static/stories',
          ),
        },
      },
      plugins: [imagetools()],
      // https://github.com/nextauthjs/next-auth/discussions/4566
      define: {
        'process.env': process.env,
      },
    } satisfies UserConfig),
  staticDirs: ['../static/public', '../static/stories'],
  stories: ['../src/**/*.@(mdx|stories.@(ts|tsx))'],
  addons: [
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@storybook/addon-essentials'),
    getAbsolutePath('@storybook/addon-interactions'),
    getAbsolutePath('@storybook/addon-coverage'),
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('@storybook/addon-mdx-gfm'),
  ],
  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
    options: {},
  },
  docs: {},
  previewHead: (head) => `
    ${head}
    ${fonts
      .map(
        (font: string) =>
          `<link rel="preload" href="${font}" as="font" type="font/woff2" crossOrigin="anonymous" />`,
      )
      .join('\n')}
  `,
};
export default config;

function getAbsolutePath(value: string): string {
  return dirname(require.resolve(join(value, 'package.json')));
}
