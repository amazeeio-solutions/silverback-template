import { ImageSource } from '@custom/schema';

export const createMockImageSource = (seed: number): ImageSource => {
  return `https://picsum.photos/200/200?random=${seed}` as ImageSource;
};

export const createMockProduct = (
  id: string,
  overrides: Record<string, unknown> = {},
) => ({
  id,
  title: `Product ${id}`,
  price: 99.99,
  sku: `SKU-${id}`,
  stock: 10,
  teaserImage: {
    alt: `Product ${id}`,
    source: createMockImageSource(parseInt(id)),
  },
  ...overrides,
});
