import { describe, expect, it } from 'vitest';

import { transformUrlToImageSource } from './utils';

describe('transformUrlToImageSource', () => {
  it('should transform valid URL to JSON ImageSource', () => {
    const url = 'https://example.com/image.jpg';
    const alt = 'Test Image';

    const result = transformUrlToImageSource(url, alt);

    expect(typeof result).toBe('string');
    const parsed = JSON.parse(result);
    expect(parsed.src).toBe(url);
    expect(parsed.alt).toBe(alt);
    expect(parsed).toHaveProperty('width');
    expect(parsed).toHaveProperty('height');
    expect(parsed).toHaveProperty('transform');
    expect(parsed).toHaveProperty('sizes');
  });

  it('should throw error for empty string URL', () => {
    expect(() => transformUrlToImageSource('', 'Alt text')).toThrow(
      'Invalid image URL provided: "". ImageSource URL cannot be empty.',
    );
  });

  it('should throw error for whitespace-only URL', () => {
    expect(() => transformUrlToImageSource('   ', 'Alt text')).toThrow(
      'Invalid image URL provided: "   ". ImageSource URL cannot be empty.',
    );
  });

  it('should throw error for undefined URL', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transformUrlToImageSource(undefined as any, 'Alt text'),
    ).toThrow(
      'Invalid image URL provided: "undefined". ImageSource URL cannot be empty.',
    );
  });

  it('should throw error for null URL', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => transformUrlToImageSource(null as any, 'Alt text')).toThrow(
      'Invalid image URL provided: "null". ImageSource URL cannot be empty.',
    );
  });

  it('should trim whitespace from valid URL', () => {
    const url = '  https://example.com/image.jpg  ';
    const alt = 'Test Image';

    const result = transformUrlToImageSource(url, alt);

    const parsed = JSON.parse(result);
    expect(parsed.src).toBe('https://example.com/image.jpg');
  });

  it('should handle missing alt text with default empty string', () => {
    const url = 'https://example.com/image.jpg';

    const result = transformUrlToImageSource(url);

    const parsed = JSON.parse(result);
    expect(parsed.src).toBe(url);
    expect(parsed.alt).toBe('');
  });
});
