import { WorkflowStatusNotification } from '@amazeelabs/publisher-shared';
import { createServer, Server } from 'http';
import { AddressInfo } from 'net';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, expect, test, vi } from 'vitest';

import { createApp } from './server';
import { clearConfig, PublisherConfigLocal, setConfig } from './tools/config';
import { core, CoreGithubWorkflow } from './tools/core';
import { getDatabase } from './tools/database';
import { OAuth2GrantTypes } from './tools/oAuth2GrantTypes';

vi.mock('./tools/database');

// `./tools/core` resolves the mode with `getConfig()` on module level, which
// happens before any test is able to provide a configuration.
vi.mock('./tools/core', async () => {
  const { BehaviorSubject, Subject } = await import('rxjs');
  const { OutputSubject } = await import('./tools/output');
  return {
    core: {
      state: {
        applicationState$: new Subject(),
        workflowState$: new BehaviorSubject('unknown'),
        workflowRunUrl: '',
      },
      output$: new OutputSubject(),
      start: vi.fn(),
      stop: vi.fn(),
      build: vi.fn(),
      clean: vi.fn(),
      getBuildNumber: vi.fn(() => 0),
    },
  };
});

const configWithoutServe: PublisherConfigLocal = {
  mode: 'local',
  publisherPort: 3000,
  databaseUrl: ':memory:',
  commands: {
    clean: 'echo "clean"',
    build: { command: 'echo "build"' },
  },
};

const configWithServe: PublisherConfigLocal = {
  ...configWithoutServe,
  commands: {
    ...configWithoutServe.commands,
    serve: {
      command: 'echo "serve"',
      readyPattern: 'serve',
      port: 3001,
    },
  },
};

const validTokenResponse = {
  status: 200,
  body: {
    access_token: 'access-token',
    refresh_token: 'refresh-token',
    token_type: 'bearer',
    expires_in: 3600,
  },
};

/**
 * The OAuth2 provider is a real local server, so that simple-oauth2 performs
 * actual token requests and the publisher access check an actual fetch.
 */
let oAuth2Provider: Server;
let oAuth2ProviderHost = '';
let tokenEndpointResponse: { status: number; body: Record<string, unknown> };
let publisherAccessStatus: number;

beforeAll(async () => {
  oAuth2Provider = createServer((incoming, response) => {
    incoming.on('data', () => {});
    incoming.on('end', () => {
      if (incoming.url === '/publisher/access') {
        response.writeHead(publisherAccessStatus);
        response.end();
        return;
      }
      response.writeHead(tokenEndpointResponse.status, {
        'Content-Type': 'application/json',
      });
      response.end(JSON.stringify(tokenEndpointResponse.body));
    });
  });
  await new Promise<void>((resolve) => {
    oAuth2Provider.listen(0, '127.0.0.1', resolve);
  });
  const address = oAuth2Provider.address() as AddressInfo;
  oAuth2ProviderHost = `http://127.0.0.1:${address.port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    // Keep-alive sockets would make the server wait for their timeout.
    oAuth2Provider.closeAllConnections();
    oAuth2Provider.close((error) => (error ? reject(error) : resolve()));
  });
});

const configWithOAuth2 = (): PublisherConfigLocal => ({
  ...configWithoutServe,
  oAuth2: {
    clientId: 'publisher',
    clientSecret: 'publisher-secret',
    scope: 'publisher',
    tokenHost: oAuth2ProviderHost,
    tokenPath: '/oauth/token',
    authorizePath: '/oauth/authorize',
    grantType: OAuth2GrantTypes.AuthorizationCode,
    sessionSecret: 'session-secret',
  },
});

type Agent = ReturnType<typeof request.agent>;

/**
 * The agent keeps the session and origin cookies across requests, which the
 * OAuth2 authorization code flow relies on.
 */
const createOAuth2Agent = (): Agent => {
  vi.stubEnv('PUBLISHER_SKIP_AUTHENTICATION', 'false');
  setConfig(configWithOAuth2());
  return request.agent(createApp());
};

const logIn = async (agent: Agent): Promise<request.Response> => {
  const authorizeResponse = await agent.get('/oauth');
  const authorizeUrl = new URL(String(authorizeResponse.headers['location']));
  return agent.get('/oauth/callback').query({
    code: 'authorization-code',
    state: String(authorizeUrl.searchParams.get('state')),
  });
};

type Database = Awaited<ReturnType<typeof getDatabase>>;

const mockBuildModel = (build: Partial<Database['Build']>): void => {
  vi.mocked(getDatabase).mockResolvedValue({
    Build: build,
  } as unknown as Database);
};

const workflowState = (): CoreGithubWorkflow['state'] =>
  (core as CoreGithubWorkflow).state;

beforeEach(() => {
  vi.stubEnv('PUBLISHER_SKIP_AUTHENTICATION', 'true');
  vi.clearAllMocks();
  clearConfig();
  setConfig(configWithoutServe);
  tokenEndpointResponse = { ...validTokenResponse };
  publisherAccessStatus = 200;
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

test('every response prevents indexing and caching', async () => {
  const response = await request(createApp()).post('/___status/build');
  expect(response.status).toBe(200);
  expect(response.headers['x-robots-tag']).toBe('noindex, nofollow');
  expect(response.headers['cache-control']).toBe('no-cache');
});

test('configured response headers are applied on every route', async () => {
  setConfig({
    ...configWithoutServe,
    responseHeaders: new Map([
      ['X-Frame-Options', 'deny'],
      ['Permissions-Policy', 'geolocation=()'],
    ]),
  });
  const app = createApp();

  const buildResponse = await request(app).post('/___status/build');
  expect(buildResponse.headers['x-frame-options']).toBe('deny');
  expect(buildResponse.headers['permissions-policy']).toBe('geolocation=()');

  const redirectResponse = await request(app).get('/');
  expect(redirectResponse.headers['x-frame-options']).toBe('deny');
  expect(redirectResponse.headers['permissions-policy']).toBe('geolocation=()');
});

test('build route triggers a build', async () => {
  const response = await request(createApp()).post('/___status/build');
  expect(response.status).toBe(200);
  expect(core.build).toHaveBeenCalledOnce();
});

test('clean route triggers a clean build', async () => {
  const response = await request(createApp()).post('/___status/clean');
  expect(response.status).toBe(200);
  expect(core.clean).toHaveBeenCalledOnce();
});

test('update route accepts a json body', async () => {
  const response = await request(createApp())
    .post('/___status/update')
    .send({ id: 'a-page', operation: 'update' });
  expect(response.status).toBe(200);
  expect(response.body).toBe(true);
});

test('history route returns all builds, newest first', async () => {
  const builds = [
    { id: 2, success: true },
    { id: 1, success: false },
  ];
  const findAll = vi.fn().mockResolvedValue(builds);
  mockBuildModel({ findAll });

  const response = await request(createApp()).get('/___status/history');
  expect(response.status).toBe(200);
  expect(response.body).toStrictEqual(builds);
  expect(findAll).toHaveBeenCalledWith({ order: [['id', 'DESC']] });
});

test('history route returns a single build by id', async () => {
  const build = { id: 42, success: true };
  const findByPk = vi.fn().mockResolvedValue(build);
  mockBuildModel({ findByPk });

  const response = await request(createApp()).get('/___status/history/42');
  expect(response.status).toBe(200);
  expect(response.body).toStrictEqual(build);
  expect(findByPk).toHaveBeenCalledWith('42');
});

test('github workflow status rejects an invalid notification', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const onWorkflowState = vi.fn();
  const subscription =
    workflowState().workflowState$.subscribe(onWorkflowState);
  onWorkflowState.mockClear();

  const response = await request(createApp())
    .post('/github-workflow-status')
    .send({ status: 'exploded', workflowRunUrl: 'not-a-url' });

  expect(response.status).toBe(400);
  expect(response.text).toBe('Invalid request\n');
  expect(onWorkflowState).not.toHaveBeenCalled();
  subscription.unsubscribe();
});

test('github workflow status stores the run url and publishes the status', async () => {
  const notification: WorkflowStatusNotification = {
    status: 'success',
    workflowRunUrl: 'https://github.com/AmazeeLabs/project/actions/runs/1',
  };
  const onWorkflowState = vi.fn();
  const subscription =
    workflowState().workflowState$.subscribe(onWorkflowState);
  onWorkflowState.mockClear();

  const response = await request(createApp())
    .post('/github-workflow-status')
    .send(notification);

  expect(response.status).toBe(200);
  expect(workflowState().workflowRunUrl).toBe(notification.workflowRunUrl);
  expect(onWorkflowState).toHaveBeenCalledWith('success');
  subscription.unsubscribe();
});

test('browsers are redirected to the status page while not ready', async () => {
  setConfig(configWithServe);
  const response = await request(createApp())
    .get('/blog/an-article?page=2')
    .set('Accept', 'text/html');

  expect(response.status).toBe(302);
  expect(response.headers['location']).toBe(
    '/___status/status.html?dest=/blog/an-article?page=2',
  );
});

test('non browser requests get a 404 while not ready', async () => {
  setConfig(configWithServe);
  const response = await request(createApp())
    .get('/blog/an-article')
    .set('Accept', 'application/json');

  expect(response.status).toBe(404);
  // An empty body proves the wildcard handler answered, not the express
  // default 404, which would render "Cannot GET /blog/an-article".
  expect(response.text).toBe('');
});

test('the root redirects to the status page if nothing is served', async () => {
  const response = await request(createApp()).get('/');

  expect(response.status).toBe(302);
  expect(response.headers['location']).toBe('/___status/');
});

test('the login page offers a log in link and remembers its own path', async () => {
  const response = await createOAuth2Agent().get('/oauth/login');

  expect(response.status).toBe(200);
  expect(response.text).toBe('<a href="/oauth">Log in</a>');
  expect(String(response.headers['set-cookie'])).toContain(
    `origin=${encodeURIComponent('/oauth/login')}`,
  );
});

test('the oauth route redirects to the authorization provider', async () => {
  const response = await createOAuth2Agent().get('/oauth');

  expect(response.status).toBe(302);
  const authorizeUrl = new URL(String(response.headers['location']));
  expect(`${authorizeUrl.origin}${authorizeUrl.pathname}`).toBe(
    `${oAuth2ProviderHost}/oauth/authorize`,
  );
  expect(authorizeUrl.searchParams.get('client_id')).toBe('publisher');
  expect(authorizeUrl.searchParams.get('state')).toEqual(expect.any(String));
});

test('the oauth route fails without an oauth2 client', async () => {
  vi.stubEnv('PUBLISHER_SKIP_AUTHENTICATION', 'false');

  const response = await request(createApp()).get('/oauth');

  expect(response.status).toBe(500);
  expect(response.text).toContain('Missing OAuth2 client.');
});

test('the callback rejects a state that does not match the session', async () => {
  const response = await createOAuth2Agent()
    .get('/oauth/callback')
    .query({
      code: 'authorization-code',
      state: Buffer.from('forged-state').toString('base64'),
    });

  expect(response.status).toBe(400);
  expect(response.body).toContain('State does not match.');
});

test('the callback redirects to the login page without an origin cookie', async () => {
  const response = await logIn(createOAuth2Agent());

  expect(response.status).toBe(302);
  expect(response.headers['location']).toBe('/oauth/login');
});

test('the callback redirects to the origin the user was sent away from', async () => {
  const agent = createOAuth2Agent();
  const protectedResponse = await agent.get('/___status/history');
  expect(protectedResponse.headers['location']).toBe('/oauth');

  const response = await logIn(agent);

  expect(response.status).toBe(302);
  expect(response.headers['location']).toBe('/___status/history');
});

test('the callback reports a failed token exchange', async () => {
  tokenEndpointResponse = { status: 401, body: { error: 'invalid_grant' } };

  const response = await logIn(createOAuth2Agent());

  expect(response.status).toBe(500);
  expect(response.body).toContain('Authentication failed with error:');
});

test('the login page confirms granted publisher access', async () => {
  const agent = createOAuth2Agent();
  await logIn(agent);

  const response = await agent.get('/oauth/login');

  expect(response.status).toBe(200);
  expect(response.text).toContain('Publisher access is granted.');
  expect(response.text).toContain('href="/___status/"');
});

test('the login page reports missing publisher access', async () => {
  publisherAccessStatus = 403;
  const agent = createOAuth2Agent();
  await logIn(agent);

  const response = await agent.get('/oauth/login');

  expect(response.status).toBe(200);
  expect(response.text).toContain('Publisher access is not granted.');
  expect(response.text).toContain('href="/oauth/logout"');
});

test('logging out without a token is unauthorized', async () => {
  const response = await createOAuth2Agent().get('/oauth/logout');

  expect(response.status).toBe(401);
  expect(response.text).toBe('No token found.');
});

test('logging out destroys the session', async () => {
  const agent = createOAuth2Agent();
  await logIn(agent);

  const response = await agent.get('/oauth/logout');
  expect(response.status).toBe(302);
  expect(response.headers['location']).toBe('/oauth/login');

  const afterLogout = await agent.get('/oauth/login');
  expect(afterLogout.text).toBe('<a href="/oauth">Log in</a>');
});
