import { NextFunction, Request, Response } from 'express';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { defaultConfig } from '../mode-local/tools/testing';
import {
  getAuthenticationMiddleware,
  isSessionRequired,
} from './authentication';
import {
  clearConfig,
  getConfig,
  PublisherConfigLocal,
  setConfig,
} from './config';
import {
  oAuth2AuthCodeMiddleware,
  oAuth2ResourceOwnerPasswordMiddleware,
} from './oAuth2';
import { OAuth2GrantTypes } from './oAuth2GrantTypes';

type OAuth2Config = NonNullable<PublisherConfigLocal['oAuth2']>;

const oAuth2ConfigWithGrantType = (
  grantType: OAuth2GrantTypes,
): OAuth2Config => ({
  clientId: 'publisher',
  clientSecret: 'publisher-secret',
  scope: 'publisher',
  tokenHost: 'http://127.0.0.1:8888',
  tokenPath: '/oauth/token',
  authorizePath: '/oauth/authorize',
  grantType,
});

type FakeRequestOptions = { headers?: Record<string, string> };

const createRequest = (options: FakeRequestOptions = {}): Request =>
  ({ headers: options.headers ?? {} }) as unknown as Request;

type RecordedResponse = {
  statusCode: number | null;
  body: unknown;
  headers: Record<string, string>;
};

const createResponse = (): [Response, RecordedResponse] => {
  const recorded: RecordedResponse = {
    statusCode: null,
    body: null,
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
    json: (body: unknown) => {
      recorded.body = body;
      return response;
    },
    set: (name: string, value: string) => {
      recorded.headers[name] = value;
      return response;
    },
  };
  return [response as unknown as Response, recorded];
};

const basicAuthorizationHeader = (login: string, password: string): string =>
  `Basic ${Buffer.from(`${login}:${password}`).toString('base64')}`;

beforeEach(() => {
  setConfig({ ...defaultConfig });
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  clearConfig();
});

test('authentication is skipped when the environment says so', () => {
  vi.stubEnv('PUBLISHER_SKIP_AUTHENTICATION', 'true');
  setConfig({
    ...defaultConfig,
    oAuth2: oAuth2ConfigWithGrantType(OAuth2GrantTypes.AuthorizationCode),
  });

  const middleware = getAuthenticationMiddleware(getConfig());
  expect(middleware).not.toBe(oAuth2AuthCodeMiddleware);

  const next = vi.fn();
  const [response] = createResponse();
  middleware(createRequest(), response, next as unknown as NextFunction);
  expect(next).toHaveBeenCalledOnce();
});

test('the authorization code grant type selects the auth code middleware', () => {
  setConfig({
    ...defaultConfig,
    oAuth2: oAuth2ConfigWithGrantType(OAuth2GrantTypes.AuthorizationCode),
  });
  expect(getAuthenticationMiddleware(getConfig())).toBe(
    oAuth2AuthCodeMiddleware,
  );
});

test('the resource owner password grant type selects its middleware', () => {
  setConfig({
    ...defaultConfig,
    oAuth2: oAuth2ConfigWithGrantType(OAuth2GrantTypes.ResourceOwnerPassword),
  });
  expect(getAuthenticationMiddleware(getConfig())).toBe(
    oAuth2ResourceOwnerPasswordMiddleware,
  );
});

test('an unsupported grant type is reported and does not authenticate', () => {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  setConfig({
    ...defaultConfig,
    oAuth2: oAuth2ConfigWithGrantType(
      'client_credentials' as unknown as OAuth2GrantTypes,
    ),
  });

  const middleware = getAuthenticationMiddleware(getConfig());
  expect(consoleError).toHaveBeenCalledWith(
    'Only the AuthorizationCode and ResourceOwnerPassword grant types are currently supported.',
  );

  const next = vi.fn();
  const [response] = createResponse();
  middleware(createRequest(), response, next as unknown as NextFunction);
  expect(next).toHaveBeenCalledOnce();
});

test('basic auth is used when oauth2 is not configured', () => {
  setConfig({
    ...defaultConfig,
    basicAuth: { username: 'publisher', password: 'publisher-password' },
  });
  const middleware = getAuthenticationMiddleware(getConfig());

  const next = vi.fn();
  const [response, recorded] = createResponse();
  middleware(createRequest(), response, next as unknown as NextFunction);

  expect(next).not.toHaveBeenCalled();
  expect(recorded.statusCode).toBe(401);
  expect(recorded.headers['WWW-Authenticate']).toBe('Basic');
});

test('basic auth accepts the configured credentials', () => {
  setConfig({
    ...defaultConfig,
    basicAuth: { username: 'publisher', password: 'publisher-password' },
  });
  const middleware = getAuthenticationMiddleware(getConfig());

  const next = vi.fn();
  const [response, recorded] = createResponse();
  middleware(
    createRequest({
      headers: {
        authorization: basicAuthorizationHeader(
          'publisher',
          'publisher-password',
        ),
      },
    }),
    response,
    next as unknown as NextFunction,
  );

  expect(next).toHaveBeenCalledOnce();
  expect(recorded.statusCode).toBeNull();
});

test('everything passes through when no authentication is configured', () => {
  const middleware = getAuthenticationMiddleware(getConfig());

  const next = vi.fn();
  const [response, recorded] = createResponse();
  middleware(createRequest(), response, next as unknown as NextFunction);

  expect(next).toHaveBeenCalledOnce();
  expect(recorded.statusCode).toBeNull();
});

test('a session is required for the authorization code grant type only', () => {
  setConfig({
    ...defaultConfig,
    oAuth2: oAuth2ConfigWithGrantType(OAuth2GrantTypes.AuthorizationCode),
  });
  expect(isSessionRequired()).toBe(true);

  setConfig({
    ...defaultConfig,
    oAuth2: oAuth2ConfigWithGrantType(OAuth2GrantTypes.ResourceOwnerPassword),
  });
  expect(isSessionRequired()).toBe(false);

  setConfig({ ...defaultConfig });
  expect(isSessionRequired()).toBe(false);
});
