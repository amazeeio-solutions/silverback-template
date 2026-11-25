import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createStrangler } from './index';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function createMockEvent(url: string) {
  return {
    rawUrl: url,
    headers: { accept: 'text/html' },
    httpMethod: 'GET',
    body: null,
    isBase64Encoded: false,
    rawQuery: '',
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    path: new URL(url).pathname,
    multiValueHeaders: {},
  };
}

describe('createStrangler', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('strips content-encoding, content-length, and transfer-encoding from responses', async () => {
    const html = '<html><body>Hello</body></html>';
    mockFetch.mockResolvedValue(
      new Response(html, {
        status: 200,
        headers: {
          'content-type': 'text/html',
          'content-encoding': 'gzip',
          'content-length': '42',
          'transfer-encoding': 'chunked',
          'x-custom-header': 'keep-me',
        },
      }),
    );

    const handler = createStrangler([{ url: 'https://legacy.example.com' }]);

    const result = await handler(
      createMockEvent('https://site.example.com/partners'),
      {} as never,
    );

    expect(result).toBeDefined();
    expect(result!.statusCode).toBe(200);
    expect(result!.body).toBe(html);
    expect(result!.headers).not.toHaveProperty('content-encoding');
    expect(result!.headers).not.toHaveProperty('content-length');
    expect(result!.headers).not.toHaveProperty('transfer-encoding');
    expect(result!.headers).toHaveProperty('x-custom-header', 'keep-me');
    expect(result!.headers).toHaveProperty('content-type', 'text/html');
  });

  it('skips legacy system when applies returns false', async () => {
    const handler = createStrangler([
      {
        url: 'https://legacy.example.com',
        applies: () => false,
      },
    ]);

    const result = await handler(
      createMockEvent('https://site.example.com/page'),
      {} as never,
    );

    expect(result!.statusCode).toBe(404);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('skips to next system when process returns undefined', async () => {
    mockFetch
      .mockResolvedValueOnce(new Response('', { status: 200 }))
      .mockResolvedValueOnce(
        new Response('<html>Legacy</html>', {
          status: 200,
          headers: { 'content-type': 'text/html' },
        }),
      );

    const handler = createStrangler([
      {
        url: 'https://drupal.example.com',
        process: (response) =>
          [301, 302].includes(response.status) ? response : undefined,
      },
      {
        url: 'https://legacy.example.com',
      },
    ]);

    const result = await handler(
      createMockEvent('https://site.example.com/page'),
      {} as never,
    );

    expect(result!.statusCode).toBe(200);
    expect(result!.body).toBe('<html>Legacy</html>');
  });
});
