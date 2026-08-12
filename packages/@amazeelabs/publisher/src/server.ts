import cors from 'cors';
import express, {
  ErrorRequestHandler,
  Request,
  RequestHandler,
  Response,
} from 'express';
import expressWs from 'express-ws';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { createHttpTerminator } from 'http-terminator';
import { HttpTerminator } from 'http-terminator/src/types';
import referrerPolicy from 'referrer-policy';
import { map, scan, shareReplay, Subject, Subscription } from 'rxjs';
import { fileURLToPath } from 'url';

import { stateNotify } from './notify';
import {
  ApplicationState,
  workflowStatusNotificationSchema,
} from './shared/exports';
import {
  getAuthenticationMiddleware,
  isSessionRequired,
} from './tools/authentication';
import { getConfig } from './tools/config';
import { core, CoreGithubWorkflow } from './tools/core';
import { getBuild, listBuilds } from './tools/database';
import {
  getOAuth2AuthorizeUrl,
  getPersistedAccessToken,
  hasPublisherAccess,
  initializeSession,
  isAuthenticated,
  oAuth2AuthorizationCodeClient,
  persistAccessToken,
  stateMatches,
} from './tools/oAuth2';

// Resolved from the module URL, so that it works both from `src` and from the
// bundle in `dist`.
const uiPath = fileURLToPath(new URL('./ui', import.meta.url));

// Without an 'error' listener `ws` rethrows socket errors (e.g. a malformed
// frame) as an uncaught exception, which crashes the process.
const logWebSocketError = (error: Error): void => {
  console.error('WebSocket connection error:', error.message);
};

/**
 * Releases the subscription that feeds a socket once the client is gone.
 *
 * `sub.unsubscribe` cannot be handed to `on('close')` directly: rxjs needs it
 * bound to its subscription, and a listener is called with the WebSocket as
 * `this`, so the subscription would silently stay alive and keep pushing into a
 * closed socket for the lifetime of the process.
 */
const unsubscribeOnClose = (
  ws: { on(event: 'close', listener: () => void): void },
  sub: Subscription,
): void => {
  ws.on('close', () => sub.unsubscribe());
};

/**
 * Express 4 ignores the promise a handler returns, so a rejection would neither
 * answer the request nor reach the error handling middleware - it would surface
 * as an unhandled rejection and exit the process.
 */
const handleAsync =
  <Params = Record<string, string>>(
    handler: (request: Request<Params>, response: Response) => Promise<unknown>,
  ): RequestHandler<Params> =>
  (request, response, next) => {
    handler(request, response).catch(next);
  };

// These sockets only carry pushes from the server, so nothing legitimate ever
// arrives from a client. `ws` defaults to 100 MB and buffers a message until it
// is complete, which would let a handful of sockets exhaust the heap.
const maxWebSocketPayload = 64 * 1024;

const createApp = (): expressWs.Application => {
  const expressServer = express();
  const expressWsInstance = expressWs(expressServer, undefined, {
    wsOptions: { maxPayload: maxWebSocketPayload },
  });
  const { app } = expressWsInstance;

  app.locals.isReady = false;

  // Express 4 defaults to qs, which expands brackets into arrays and objects and
  // has memory-exhaustion advisories reachable from any query string. Only flat
  // string parameters are ever read, so the simple parser is enough.
  app.set('query parser', 'simple');

  // A session is only needed for OAuth2 Authorization Code grant type.
  if (isSessionRequired()) {
    initializeSession(expressServer);
  }
  // Authentication middleware based on the configuration.
  const authMiddleware = getAuthenticationMiddleware(getConfig());

  // Prevent indexing.
  app.use((_, res, next) => {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    next();
  });

  // Allow cross-origin requests
  // @TODO see if we need to lock this down
  // Default config:
  //{
  //   "origin": "*",
  //   "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
  //   "preflightContinue": false,
  //   "optionsSuccessStatus": 204
  // }
  app.use(cors({ ...(getConfig().corsOptions ?? {}) }));

  // Chromium based browsers employ strict-origin-when-cross-origin if no Referrer Policy set
  // @TODO see if we need to lock this down
  app.use(referrerPolicy());

  app.use(express.json());

  app.use((req, res, next) => {
    res.set('Cache-control', 'no-cache');
    next();
  });

  // Add any configured response headers which should apply on every route.
  app.use((req, res, next) => {
    // The spread operator applied on a Map generates a 2D key-value array. So
    // if we have a Map with two items: key1 => value1, key2 => value2, then
    // the spread operator applied on the Map would return
    // [["key1", "value1"], ["key2", "value2"]].
    [...(getConfig().responseHeaders || new Map<string, string>())].map(
      (responseHeader) => {
        res.set(responseHeader[0], responseHeader[1]);
      },
    );
    next();
  });

  core.state.applicationState$
    .pipe(
      scan<ApplicationState, ApplicationState[]>(
        (history, state) =>
          // Keep the last 10 states in the history.
          history.concat([state]).slice(-10),
        [],
      ),
    )
    .subscribe((stateHistory) => {
      const state =
        stateHistory[stateHistory.length - 1] || ApplicationState.Starting;
      app.locals.isReady = state === ApplicationState.Ready;
      stateNotify(stateHistory, core.getBuildNumber());
    });

  const updates$ = new Subject();
  app.post('/___status/update', (req, res) => {
    updates$.next(req.body);
    res.json(true);
  });
  app.ws('/___status/changes', (ws) => {
    const sub = updates$.subscribe((data) => {
      ws.send(JSON.stringify(data));
    });
    ws.on('error', logWebSocketError);
    unsubscribeOnClose(ws, sub);
  });

  app.post('/___status/build', (req, res) => {
    core.build();
    res.send();
  });

  // The response is not made to wait for the clean, which runs for minutes, so
  // its failure has to be caught here rather than left unhandled.
  app.post('/___status/clean', (req, res) => {
    core.clean().catch((error) => {
      console.error('Clean failed:', error);
    });
    res.send();
  });

  const outputWithReplay$ = core.output$
    .pipe(
      map((chunk) => `${new Date().toISOString().substring(11, 19)} ${chunk}`),
    )
    .pipe(shareReplay(500));
  outputWithReplay$.subscribe().unsubscribe(); // Make shareReplay work immediately.
  app.use('/___status/logs', authMiddleware);
  app.ws('/___status/logs', (ws) => {
    const sub = outputWithReplay$.subscribe((chunk) => {
      ws.send(chunk);
    });
    ws.on('error', logWebSocketError);
    unsubscribeOnClose(ws, sub);
  });

  const applicationStateWithReplay$ = core.state.applicationState$.pipe(
    shareReplay(1),
  );
  applicationStateWithReplay$.subscribe().unsubscribe(); // Make shareReplay work immediately.
  app.ws('/___status/updates', (ws) => {
    const sub = applicationStateWithReplay$.subscribe((state) => {
      ws.send(JSON.stringify(state));
    });
    ws.on('error', logWebSocketError);
    unsubscribeOnClose(ws, sub);
  });

  app.use('/___status/history', authMiddleware);
  app.get(
    '/___status/history',
    handleAsync(async (req, res) => {
      res.json(await listBuilds());
    }),
  );

  app.get(
    '/___status/history/:id',
    handleAsync<{ id: string }>(async (req, res) => {
      res.json(await getBuild(req.params.id));
    }),
  );

  // ---------------------------------------------------------------------------
  // OAuth2 routes
  // ---------------------------------------------------------------------------

  app.use('/___status', authMiddleware);
  app.use('/___status', express.static(uiPath));

  // Fallback route for login. Is used if there is no origin cookie.
  app.get(
    '/oauth/login',
    handleAsync(async (req, res) => {
      if (await isAuthenticated(req)) {
        const accessPublisher = await hasPublisherAccess(req);
        if (accessPublisher) {
          res.send(
            'Publisher access is granted. <a href="/___status/">View status</a>',
          );
        } else {
          res.send(
            'Publisher access is not granted. Contact your site administrator. <a href="/oauth/logout">Log out</a>',
          );
        }
      } else {
        res.cookie('origin', req.path).send('<a href="/oauth">Log in</a>');
      }
    }),
  );

  // Redirects to authentication provider.
  app.get('/oauth', (req, res) => {
    const client = oAuth2AuthorizationCodeClient();
    if (!client) {
      throw new Error('Missing OAuth2 client.');
    }
    const authorizationUri = getOAuth2AuthorizeUrl(client, req);
    res.redirect(authorizationUri);
  });

  // Callback from authentication provider.
  app.get(
    '/oauth/callback',
    handleAsync(async (req, res) => {
      const oAuth2Config = getConfig().oAuth2;
      if (!oAuth2Config) {
        throw new Error('Missing OAuth2 configuration.');
      }

      const client = oAuth2AuthorizationCodeClient();
      if (!client) {
        throw new Error('Missing OAuth2 client.');
      }

      // Check if the state matches.
      if (!stateMatches(req)) {
        return res
          .status(400)
          .json(
            'State does not match. Check if the Drupal Consumer entity redirect URI is properly set.',
          );
      }

      const { code } = req.query;
      const options = {
        code,
        scope: oAuth2Config.scope,
        // Do not include redirect_uri, makes Drupal simple_oauth fail.
        // Returns 400 Bad Request.
        //redirect_uri: 'http://127.0.0.1:7777/callback',
      };

      try {
        const accessToken = await client.getToken(
          // @ts-expect-error Missing redirect_uri.
          options,
        );
        persistAccessToken(accessToken, req);

        if (req.cookies.origin) {
          res.redirect(req.cookies.origin);
        } else {
          res.redirect('/oauth/login');
        }
      } catch (error) {
        console.error(error);
        return res.status(500).json(
          `Authentication failed with error: ${
            // @ts-expect-error `error` is unknown
            error.message
          }`,
        );
      }
    }),
  );

  // Removes the session.
  app.get(
    '/oauth/logout',
    handleAsync(async (req, res) => {
      const accessToken = getPersistedAccessToken(req);
      if (!accessToken) {
        return res.status(401).send('No token found.');
      }

      // Requires this Drupal patch
      // https://www.drupal.org/project/simple_oauth/issues/2945273
      // await accessToken.revokeAll();
      req.session.destroy(function (err) {
        console.log('Remove session', err);
      });
      res.redirect('/oauth/login');
    }),
  );

  // Only registered in the mode that owns the state it drives. In "local" mode
  // there is no workflowState$, and a valid notification would throw.
  if (getConfig().mode === 'github-workflow') {
    app.post('/github-workflow-status', (req, res) => {
      const result = workflowStatusNotificationSchema.safeParse(req.body);
      if (!result.success) {
        console.error(result.error);
        res.status(400).send('Invalid request\n');
        return;
      }
      const { status, workflowRunUrl } = result.data;
      const state = (core as CoreGithubWorkflow).state;
      state.workflowRunUrl = workflowRunUrl;
      state.workflowState$.next(status);
      res.send();
    });
  }

  const config = getConfig();
  if (config.mode === 'local' && config.commands.serve?.port) {
    // Use the authentication middleware for the proxy.
    app.use(
      '/',
      authMiddleware,
      createProxyMiddleware({
        pathFilter: () => app.locals.isReady,
        target: `http://127.0.0.1:${config.commands.serve.port}`,
      }),
    );
  } else {
    // When not serving, redirect to the status
    // that will use the authentication middleware if needed.
    app.get('/', async (req, res) => {
      res.redirect('/___status/');
    });
  }

  app.get('*', (req, res, next) => {
    if (req.app.locals.isReady) {
      return next();
    }
    if (req.accepts('text/html')) {
      res.redirect(302, `/___status/status.html?dest=${req.originalUrl}`);
    } else {
      res.status(404);
    }
    res.end();
  });

  // Answers requests whose handler failed. Without it express replies with its
  // default HTML error page, which includes a stack trace.
  const reportRequestError: ErrorRequestHandler = (error, req, res, next) => {
    console.error(`Request to ${req.originalUrl} failed:`, error);
    if (res.headersSent) {
      return next(error);
    }
    res.status(500).send('Internal server error\n');
  };
  app.use(reportRequestError);

  return app;
};

const runServer = async (): Promise<HttpTerminator> => {
  const app = createApp();
  const host = getConfig().publisherHost || '0.0.0.0';
  const port = getConfig().publisherPort;
  const server = await app.listen({ host, port });
  const terminator = createHttpTerminator({ server });
  console.log(`Server started on http://${host}:${port}`);
  return terminator;
};

export { createApp, runServer };
