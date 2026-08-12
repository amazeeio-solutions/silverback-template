import express, { NextFunction, Request, Response } from 'express';
import { createServer, Server } from 'http';
import { AddressInfo } from 'net';
import { AuthorizationCode } from 'simple-oauth2';
import supertest from 'supertest';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  expect,
  test,
  vi,
} from 'vitest';

import { defaultConfig } from '../mode-local/tools/testing';
import { clearConfig, PublisherConfigLocal, setConfig } from './config';
import {
  getOAuth2AuthorizeUrl,
  getPersistedAccessToken,
  hasPublisherAccess,
  initializeSession,
  isAuthenticated,
  oAuth2AuthCodeMiddleware,
  oAuth2AuthorizationCodeClient,
  oAuth2ResourceOwnerPasswordMiddleware,
  persistAccessToken,
  stateMatches,
} from './oAuth2';
import { OAuth2GrantTypes } from './oAuth2GrantTypes';

type OAuth2Config = NonNullable<PublisherConfigLocal['oAuth2']>;
type FetchResponse = Awaited<ReturnType<typeof fetch>>;

// simple-oauth2 talks to the token endpoint through @hapi/wreck, so stubbing
// the global fetch only affects the publisher access calls.
const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

const respondToPublisherAccessWith = (status: number): void => {
  fetchMock.mockResolvedValue({ status } as unknown as FetchResponse);
};

/**
 * The token endpoint is served by a real local server, so that simple-oauth2
 * performs actual token requests instead of being mocked away.
 */
let tokenEndpointServer: Server;
let tokenHost = '';
let tokenEndpointResponse: { status: number; body: Record<string, unknown> };

const refreshedTokenResponse = {
  status: 200,
  body: {
    access_token: 'refreshed-access-token',
    refresh_token: 'refreshed-refresh-token',
    token_type: 'bearer',
    expires_in: 3600,
  },
};

beforeAll(async () => {
  tokenEndpointServer = createServer((request, response) => {
    request.on('data', () => {});
    request.on('end', () => {
      response.writeHead(tokenEndpointResponse.status, {
        'Content-Type': 'application/json',
      });
      response.end(JSON.stringify(tokenEndpointResponse.body));
    });
  });
  await new Promise<void>((resolve) => {
    tokenEndpointServer.listen(0, '127.0.0.1', resolve);
  });
  const address = tokenEndpointServer.address() as AddressInfo;
  tokenHost = `http://127.0.0.1:${address.port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    tokenEndpointServer.close((error) => (error ? reject(error) : resolve()));
  });
});

beforeEach(() => {
  tokenEndpointResponse = { ...refreshedTokenResponse };
  configureOAuth2();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  clearConfig();
});

const configureOAuth2 = (overrides: Partial<OAuth2Config> = {}): void => {
  setConfig({
    ...defaultConfig,
    oAuth2: {
      clientId: 'publisher',
      clientSecret: 'publisher-secret',
      scope: 'publisher',
      tokenHost,
      tokenPath: '/oauth/token',
      authorizePath: '/oauth/authorize',
      grantType: OAuth2GrantTypes.AuthorizationCode,
      ...overrides,
    },
  });
};

const configureWithoutOAuth2 = (): void => {
  setConfig({ ...defaultConfig, oAuth2: undefined });
};

type FakeSession = { tokenString?: string; state?: string };

type FakeRequestOptions = {
  session?: FakeSession;
  query?: Record<string, string>;
  headers?: Record<string, string>;
  path?: string;
  originalUrl?: string;
};

const createRequest = (options: FakeRequestOptions = {}): Request =>
  ({
    session: options.session ?? {},
    query: options.query ?? {},
    headers: options.headers ?? {},
    path: options.path ?? '/',
    originalUrl: options.originalUrl ?? '/',
  }) as unknown as Request;

type RecordedResponse = {
  statusCode: number | null;
  body: unknown;
  cookies: Record<string, string>;
  redirectedTo: string | null;
  headers: Record<string, string>;
};

const createResponse = (): [Response, RecordedResponse] => {
  const recorded: RecordedResponse = {
    statusCode: null,
    body: null,
    cookies: {},
    redirectedTo: null,
    headers: {},
  };
  const response = {
    status: (code: number) => {
      recorded.statusCode = code;
      return response;
    },
    send: (body: unknown) => {
      recorded.body = body;
      return response;
    },
    cookie: (name: string, value: string) => {
      recorded.cookies[name] = value;
      return response;
    },
    redirect: (url: string) => {
      recorded.redirectedTo = url;
      return response;
    },
    set: (name: string, value: string) => {
      recorded.headers[name] = value;
      return response;
    },
  };
  return [response as unknown as Response, recorded];
};

const authorizationCodeClient = (): AuthorizationCode => {
  const client = oAuth2AuthorizationCodeClient();
  if (!client) {
    throw new Error('OAuth2 client is not configured.');
  }
  return client;
};

const inOneHour = (): Date => new Date(Date.now() + 60 * 60 * 1000);
const oneHourAgo = (): Date => new Date(Date.now() - 60 * 60 * 1000);

const persistTokenExpiringAt = (request: Request, expiresAt: Date): void => {
  persistAccessToken(
    authorizationCodeClient().createToken({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      token_type: 'bearer',
      expires_at: expiresAt.toISOString(),
    }),
    request,
  );
};

const basicAuthorizationHeader = (login: string, password: string): string =>
  `Basic ${Buffer.from(`${login}:${password}`).toString('base64')}`;

test('a persisted access token can be read back from the session', () => {
  const request = createRequest();
  const expiresAt = inOneHour();
  persistTokenExpiringAt(request, expiresAt);

  expect(request.session.tokenString).toEqual(expect.any(String));
  expect(request.session.tokenString).not.toContain('access-token');

  const token = getPersistedAccessToken(request);
  expect(token?.token.access_token).toBe('access-token');
  expect(token?.token.refresh_token).toBe('refresh-token');
  expect(token?.token.expires_at).toEqual(expiresAt);
});

test('reading an access token returns null when the session has none', () => {
  expect(getPersistedAccessToken(createRequest())).toBeNull();
});

test('reading a corrupted access token throws', () => {
  const request = createRequest();
  persistTokenExpiringAt(request, inOneHour());
  request.session.tokenString = `${request.session.tokenString}00`;

  expect(() => getPersistedAccessToken(request)).toThrow('Decryption failed.');
});

test('stateMatches is false without a persisted state', () => {
  const request = createRequest({
    query: { state: Buffer.from('state').toString('base64') },
  });
  expect(stateMatches(request)).toBe(false);
});

test('stateMatches is false without a state in the query', () => {
  const request = createRequest({ session: { state: 'state' } });
  expect(stateMatches(request)).toBe(false);
});

test('stateMatches is true when the encoded query state matches the session', () => {
  const request = createRequest({
    session: { state: 'expected-state' },
    query: { state: Buffer.from('expected-state').toString('base64') },
  });
  expect(stateMatches(request)).toBe(true);
});

test('stateMatches is false when the encoded query state differs', () => {
  const request = createRequest({
    session: { state: 'expected-state' },
    query: { state: Buffer.from('other-state').toString('base64') },
  });
  expect(stateMatches(request)).toBe(false);
});

test('getOAuth2AuthorizeUrl persists the state and encodes it into the url', () => {
  const request = createRequest();
  const url = getOAuth2AuthorizeUrl(authorizationCodeClient(), request);

  const persistedState = request.session.state;
  expect(persistedState).toEqual(expect.any(String));

  const encodedState = Buffer.from(String(persistedState)).toString('base64');
  expect(url).toContain(encodeURIComponent(encodedState));
  expect(url.startsWith(`${tokenHost}/oauth/authorize`)).toBe(true);
  expect(new URL(url).searchParams.get('state')).toBe(encodedState);
  expect(new URL(url).searchParams.get('client_id')).toBe('publisher');
});

test('isAuthenticated is false without an access token', async () => {
  expect(await isAuthenticated(createRequest())).toBe(false);
});

test('isAuthenticated is true for an unexpired access token', async () => {
  const request = createRequest();
  persistTokenExpiringAt(request, inOneHour());
  const tokenStringBefore = request.session.tokenString;

  expect(await isAuthenticated(request)).toBe(true);
  expect(request.session.tokenString).toBe(tokenStringBefore);
});

test('isAuthenticated refreshes an expired access token and persists it', async () => {
  const request = createRequest();
  persistTokenExpiringAt(request, oneHourAgo());

  expect(await isAuthenticated(request)).toBe(true);
  expect(getPersistedAccessToken(request)?.token.access_token).toBe(
    'refreshed-access-token',
  );
});

test('isAuthenticated is false when refreshing an expired access token fails', async () => {
  tokenEndpointResponse = { status: 500, body: { error: 'server_error' } };
  const request = createRequest();
  persistTokenExpiringAt(request, oneHourAgo());
  const tokenStringBefore = request.session.tokenString;

  expect(await isAuthenticated(request)).toBe(false);
  expect(request.session.tokenString).toBe(tokenStringBefore);
});

test('hasPublisherAccess is true when the access endpoint responds with 200', async () => {
  respondToPublisherAccessWith(200);
  const request = createRequest();
  persistTokenExpiringAt(request, inOneHour());

  expect(await hasPublisherAccess(request)).toBe(true);
  expect(fetchMock).toHaveBeenCalledWith(`${tokenHost}/publisher/access`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer access-token',
    },
  });
});

test('hasPublisherAccess is false when the access endpoint responds with 403', async () => {
  respondToPublisherAccessWith(403);
  const request = createRequest();
  persistTokenExpiringAt(request, inOneHour());

  expect(await hasPublisherAccess(request)).toBe(false);
});

test('hasPublisherAccess throws without an access token', async () => {
  await expect(hasPublisherAccess(createRequest())).rejects.toThrow(
    'Missing access token.',
  );
});

test('the auth code middleware lets the build request pass unauthenticated', async () => {
  const [response, recorded] = createResponse();
  const next = vi.fn();

  await oAuth2AuthCodeMiddleware(
    createRequest({ path: '/build.json' }),
    response,
    next as unknown as NextFunction,
  );

  expect(next).toHaveBeenCalledOnce();
  expect(recorded.redirectedTo).toBeNull();
  expect(fetchMock).not.toHaveBeenCalled();
});

test('the auth code middleware continues for a user with publisher access', async () => {
  respondToPublisherAccessWith(200);
  const request = createRequest();
  persistTokenExpiringAt(request, inOneHour());
  const [response, recorded] = createResponse();
  const next = vi.fn();

  await oAuth2AuthCodeMiddleware(
    request,
    response,
    next as unknown as NextFunction,
  );

  expect(next).toHaveBeenCalledOnce();
  expect(recorded.statusCode).toBeNull();
});

test('the auth code middleware responds with 403 for a user without publisher access', async () => {
  respondToPublisherAccessWith(403);
  const request = createRequest();
  persistTokenExpiringAt(request, inOneHour());
  const [response, recorded] = createResponse();
  const next = vi.fn();

  await oAuth2AuthCodeMiddleware(
    request,
    response,
    next as unknown as NextFunction,
  );

  expect(next).not.toHaveBeenCalled();
  expect(recorded.statusCode).toBe(403);
  expect(recorded.body).toContain('does not have Publisher access');
});

test('the auth code middleware redirects an unauthenticated user to the oauth route', async () => {
  const [response, recorded] = createResponse();
  const next = vi.fn();

  await oAuth2AuthCodeMiddleware(
    createRequest({ originalUrl: '/some/page' }),
    response,
    next as unknown as NextFunction,
  );

  expect(next).not.toHaveBeenCalled();
  expect(recorded.cookies.origin).toBe('/some/page');
  expect(recorded.redirectedTo).toBe('/oauth');
});

test('the resource owner password middleware challenges requests without credentials', async () => {
  const [response, recorded] = createResponse();
  const next = vi.fn();

  await oAuth2ResourceOwnerPasswordMiddleware(
    createRequest(),
    response,
    next as unknown as NextFunction,
  );

  expect(next).not.toHaveBeenCalled();
  expect(recorded.statusCode).toBe(401);
  expect(recorded.headers['WWW-Authenticate']).toBe('Basic realm="401"');
  expect(recorded.body).toBe('Authentication required.');
});

test('the resource owner password middleware continues for valid credentials', async () => {
  tokenEndpointResponse = {
    status: 200,
    body: { access_token: 'rop-access-token', token_type: 'bearer' },
  };
  respondToPublisherAccessWith(200);
  const [response, recorded] = createResponse();
  const next = vi.fn();

  await oAuth2ResourceOwnerPasswordMiddleware(
    createRequest({
      headers: { authorization: basicAuthorizationHeader('editor', 'secret') },
    }),
    response,
    next as unknown as NextFunction,
  );

  expect(next).toHaveBeenCalledOnce();
  expect(recorded.statusCode).toBeNull();
  expect(fetchMock).toHaveBeenCalledWith(`${tokenHost}/publisher/access`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer rop-access-token',
    },
  });
});

test.each([403, 401])(
  'the resource owner password middleware reports a failed publisher authentication on %i',
  async (status) => {
    tokenEndpointResponse = {
      status: 200,
      body: { access_token: 'rop-access-token', token_type: 'bearer' },
    };
    respondToPublisherAccessWith(status);
    const [response, recorded] = createResponse();
    const next = vi.fn();

    await oAuth2ResourceOwnerPasswordMiddleware(
      createRequest({
        headers: {
          authorization: basicAuthorizationHeader('editor', 'secret'),
        },
      }),
      response,
      next as unknown as NextFunction,
    );

    expect(next).not.toHaveBeenCalled();
    expect(recorded.statusCode).toBe(401);
    expect(recorded.body).toBe('Publisher authentication failed.');
  },
);

test('the resource owner password middleware reports an internal server error on 500', async () => {
  tokenEndpointResponse = {
    status: 200,
    body: { access_token: 'rop-access-token', token_type: 'bearer' },
  };
  respondToPublisherAccessWith(500);
  const [response, recorded] = createResponse();
  const next = vi.fn();

  await oAuth2ResourceOwnerPasswordMiddleware(
    createRequest({
      headers: { authorization: basicAuthorizationHeader('editor', 'secret') },
    }),
    response,
    next as unknown as NextFunction,
  );

  expect(recorded.statusCode).toBe(401);
  expect(recorded.body).toBe('Internal server error.');
});

test('the resource owner password middleware reports an unknown error on an unexpected status', async () => {
  tokenEndpointResponse = {
    status: 200,
    body: { access_token: 'rop-access-token', token_type: 'bearer' },
  };
  respondToPublisherAccessWith(418);
  const [response, recorded] = createResponse();
  const next = vi.fn();

  await oAuth2ResourceOwnerPasswordMiddleware(
    createRequest({
      headers: { authorization: basicAuthorizationHeader('editor', 'secret') },
    }),
    response,
    next as unknown as NextFunction,
  );

  expect(recorded.statusCode).toBe(401);
  expect(recorded.body).toBe('Unknown error.');
});

test('the resource owner password middleware reports a failed oauth2 authentication when no token is issued', async () => {
  tokenEndpointResponse = {
    status: 401,
    body: { error: 'invalid_grant' },
  };
  const [response, recorded] = createResponse();
  const next = vi.fn();

  await oAuth2ResourceOwnerPasswordMiddleware(
    createRequest({
      headers: { authorization: basicAuthorizationHeader('editor', 'wrong') },
    }),
    response,
    next as unknown as NextFunction,
  );

  expect(next).not.toHaveBeenCalled();
  expect(recorded.statusCode).toBe(401);
  expect(recorded.body).toBe('OAuth2 authentication failed.');
  expect(fetchMock).not.toHaveBeenCalled();
});

test('the resource owner password middleware throws without oauth2 configuration', async () => {
  configureWithoutOAuth2();
  const [response] = createResponse();

  await expect(
    oAuth2ResourceOwnerPasswordMiddleware(
      createRequest(),
      response,
      vi.fn() as unknown as NextFunction,
    ),
  ).rejects.toThrow('OAuth2 configuration is missing.');
});

test('there is no authorization code client without oauth2 configuration', () => {
  configureWithoutOAuth2();
  expect(oAuth2AuthorizationCodeClient()).toBeNull();
});

test('the authorization code client is built from the oauth2 configuration', () => {
  const client = oAuth2AuthorizationCodeClient();
  expect(client).toBeInstanceOf(AuthorizationCode);
  expect(client?.authorizeURL()).toContain(`${tokenHost}/oauth/authorize`);
});

test('initializing a session throws without oauth2 configuration', () => {
  configureWithoutOAuth2();
  expect(() => initializeSession(express())).toThrow(
    'Missing OAuth2 configuration.',
  );
});

test('a production session uses a secure cookie behind a trusted proxy', async () => {
  configureOAuth2({
    environmentType: 'production',
    sessionSecret: 'session-secret',
  });
  const server = express();
  initializeSession(server);
  server.get('/', (request, response) => {
    request.session.state = 'state';
    response.send('ok');
  });

  expect(server.get('trust proxy')).toBe(1);

  const response = await supertest(server)
    .get('/')
    .set('X-Forwarded-Proto', 'https');
  expect(String(response.headers['set-cookie'])).toContain('Secure');
});

test('a non production session uses an insecure cookie', async () => {
  configureOAuth2({ sessionSecret: 'session-secret' });
  const server = express();
  initializeSession(server);
  server.get('/', (request, response) => {
    request.session.state = 'state';
    response.send('ok');
  });

  const response = await supertest(server).get('/');
  const cookie = String(response.headers['set-cookie']);
  expect(cookie).toContain('connect.sid');
  expect(cookie).not.toContain('Secure');
});
