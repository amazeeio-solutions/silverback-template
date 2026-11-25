# @amazeelabs/image

React Server Component for scaling and cropping images. The interface resembles
the standard `<img>` tag and produces responsive images with `srcSet` and
`sizes`.

## Usage

```tsx
import { Image } from '@amazeelabs/image';

export function MyComponent() {
  return (
    <Image
      src="https://example.com/image.jpg"
      alt="An image"
      width={400}
      height={300}
      focalPoint={[140, 110]}
    />
  );
}
```

- `width`: largest display width in pixels (required).
- `height`: optional; if set, the image is cropped to that aspect ratio.
- `focalPoint`: `[x, y]` relative to the top-left of the original image.
- `priority`: eager, high-priority loading for above-the-fold images.

On the server (`react-server` export), images are downloaded (or read from
`staticDir` for relative paths), resized with `sharp` and written to
`outputDir`. PNG sources stay PNG, everything else becomes JPG.

The default (client) export does not optimize anything: it loads the original
source and simulates the crop with a CSS background. Useful for Storybook.

## Configuration

`<ImageSettings>` overrides the defaults for its children:

- `outputDir`: where derivatives are written (default `dist/public`).
- `outputPath`: public path that serves `outputDir` (default `''`).
- `staticDir`: base directory for relative `src` paths (default `public`).
- `resolutions`: candidate widths for `srcSet` (default: common device widths).
  Only widths below the target width are used, next to the target width and
  twice the target width.
- `alterSrc`: function to rewrite `src` before processing.

## Opinions

- No `<picture>` element. Art direction is done with multiple images toggled by
  Tailwind utility classes.
- No WebP. Format optimization is left to an image CDN.
- No manual `srcSet`; it is derived from `width` and `height`. `sizes` defaults
  to `(min-width: <width>px) <width>px, 100vw`.

## Dependencies

- Not used by any package in this template.
