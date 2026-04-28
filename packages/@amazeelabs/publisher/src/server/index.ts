import {
  ApplicationState,
  workflowStatusNotificationSchema,
} from '@amazeelabs/publisher-shared';
import { Effect, Fiber, Ref, Stream } from 'effect';
import { existsSync, readFileSync } from 'fs';
import http from 'http';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { WebSocket, WebSocketServer } from 'ws';

import { Auth, AuthResult } from '../services/Auth';
import { Config, isLocalConfig, PublisherConfig } from '../services/Config';
import { Core } from '../services/Core';
import { Database } from '../services/Database';
import { Notifier } from '../services/Notifier';
import { Output } from '../services/Output';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uiDistPath = path.resolve(__dirname, '../../publisher-ui/dist');

const mimeTypes: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const getSessionCookie = (req: http.IncomingMessage): string | undefined =>
  req.headers['cookie']
    ?.split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith('publisher_session='))
    ?.split('=')[1];

const readBody = (req: http.IncomingMessage): Promise<Buffer> =>
  new Promise((resolve) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
  });

type RouteContext = {
  config: PublisherConfig;
  core: Effect.Effect.Success<typeof Core>;
  output: Effect.Effect.Success<typeof Output>;
  auth: Effect.Effect.Success<typeof Auth>;
  db: Effect.Effect.Success<typeof Database>;
  isReadyRef: Ref.Ref<boolean>;
  servePort: number | undefined;
  host: string;
};

const checkAuth = async (
  auth: RouteContext['auth'],
  req: http.IncomingMessage,
  res: http.ServerResponse,
  host: string,
): Promise<boolean> => {
  const sessionCookie = getSessionCookie(req);
  const result: AuthResult = await Effect.runPromise(
    auth.checkAuth(
      sessionCookie,
      new URL(req.url || '/', `http://${host}`).pathname,
      req.headers['authorization'],
    ),
  );
  switch (result.type) {
    case 'ok':
      return true;
    case 'redirect':
      res.writeHead(302, { Location: result.url });
      res.end();
      return false;
    case 'forbidden':
      res.writeHead(403);
      res.end(result.message);
      return false;
    case 'unauthorized':
      res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="401"' });
      res.end(result.message);
      return false;
  }
};

const handleStatusRoutes = async (
  ctx: RouteContext,
  req: http.IncomingMessage,
  res: http.ServerResponse,
  pathname: string,
  method: string,
): Promise<boolean> => {
  if (method === 'POST' && pathname === '/___status/build') {
    Effect.runFork(ctx.core.build);
    res.writeHead(200);
    res.end();
    return true;
  }

  if (method === 'POST' && pathname === '/___status/clean') {
    Effect.runFork(ctx.core.clean);
    res.writeHead(200);
    res.end();
    return true;
  }

  if (method === 'POST' && pathname === '/___status/update') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end('true');
    return true;
  }

  if (method === 'GET' && pathname === '/___status/history') {
    if (!(await checkAuth(ctx.auth, req, res, ctx.host))) {
      return true;
    }
    const builds = await Effect.runPromise(ctx.db.getBuilds);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(builds));
    return true;
  }

  if (method === 'GET' && pathname.startsWith('/___status/history/')) {
    if (!(await checkAuth(ctx.auth, req, res, ctx.host))) {
      return true;
    }
    const id = parseInt(pathname.split('/').pop()!, 10);
    const build = await Effect.runPromise(ctx.db.getBuild(id));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(build));
    return true;
  }

  if (pathname.startsWith('/___status')) {
    if (!(await checkAuth(ctx.auth, req, res, ctx.host))) {
      return true;
    }
    let filePath = pathname.replace('/___status', '') || '/index.html';
    if (filePath === '/' || filePath === '') {
      filePath = '/index.html';
    }
    const fullPath = path.join(uiDistPath, filePath);
    if (existsSync(fullPath)) {
      const content = readFileSync(fullPath);
      const ext = path.extname(fullPath);
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
    return true;
  }

  return false;
};

const handleOAuthRoutes = async (
  ctx: RouteContext,
  req: http.IncomingMessage,
  res: http.ServerResponse,
  pathname: string,
  url: URL,
): Promise<boolean> => {
  if (pathname === '/oauth/login') {
    const sessionCookie = getSessionCookie(req);
    if (sessionCookie) {
      const authed = await Effect.runPromise(
        ctx.auth.isAuthenticated(sessionCookie),
      );
      if (authed) {
        const access = await Effect.runPromise(
          ctx.auth.hasPublisherAccess(sessionCookie),
        );
        if (access) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(
            'Publisher access is granted. <a href="/___status/">View status</a>',
          );
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(
            'Publisher access is not granted. Contact your site administrator. <a href="/oauth/logout">Log out</a>',
          );
        }
        return true;
      }
    }
    res.writeHead(200, {
      'Content-Type': 'text/html',
      'Set-Cookie': 'origin=/oauth/login; Path=/; HttpOnly',
    });
    res.end('<a href="/oauth">Log in</a>');
    return true;
  }

  if (pathname === '/oauth') {
    let sessionCookie = getSessionCookie(req);
    if (!sessionCookie) {
      sessionCookie = await Effect.runPromise(ctx.auth.createSession);
    }
    const authUrl = await Effect.runPromise(
      ctx.auth.getOAuth2AuthorizeUrl(sessionCookie),
    );
    res.writeHead(302, {
      Location: authUrl,
      'Set-Cookie': `publisher_session=${sessionCookie}; Path=/; HttpOnly`,
    });
    res.end();
    return true;
  }

  if (pathname === '/oauth/callback') {
    const sessionCookie = getSessionCookie(req);
    if (!sessionCookie) {
      res.writeHead(400);
      res.end('No session found');
      return true;
    }
    const code = url.searchParams.get('code') || '';
    const queryState = url.searchParams.get('state') || '';
    const result = await Effect.runPromise(
      ctx.auth.handleOAuth2Callback(sessionCookie, code, queryState),
    );
    if (!result.success) {
      res.writeHead(400);
      res.end(result.error || 'Auth failed');
      return true;
    }
    const originCookie = req.headers['cookie']
      ?.split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith('origin='))
      ?.split('=')[1];
    res.writeHead(302, { Location: originCookie || '/oauth/login' });
    res.end();
    return true;
  }

  if (pathname === '/oauth/logout') {
    const sessionCookie = getSessionCookie(req);
    if (sessionCookie) {
      await Effect.runPromise(ctx.auth.handleLogout(sessionCookie));
    }
    res.writeHead(302, {
      Location: '/oauth/login',
      'Set-Cookie': 'publisher_session=; Path=/; HttpOnly; Max-Age=0',
    });
    res.end();
    return true;
  }

  return false;
};

const handleGithubWebhook = async (
  ctx: RouteContext,
  req: http.IncomingMessage,
  res: http.ServerResponse,
  pathname: string,
  method: string,
): Promise<boolean> => {
  if (method !== 'POST' || pathname !== '/github-workflow-status') {
    return false;
  }
  const body = await readBody(req);
  const parsed = workflowStatusNotificationSchema.safeParse(
    JSON.parse(body.toString()),
  );
  if (!parsed.success) {
    console.error(parsed.error);
    res.writeHead(400);
    res.end('Invalid request');
    return true;
  }
  if (ctx.core.handleWorkflowStatus) {
    await Effect.runPromise(
      ctx.core.handleWorkflowStatus(
        parsed.data.status,
        parsed.data.workflowRunUrl,
      ),
    );
  }
  res.writeHead(200);
  res.end();
  return true;
};

const handleProxy = async (
  ctx: RouteContext,
  req: http.IncomingMessage,
  res: http.ServerResponse,
): Promise<boolean> => {
  const isReady = Ref.get(ctx.isReadyRef).pipe(Effect.runSync);
  if (!ctx.servePort || !isReady) {
    return false;
  }
  if (!(await checkAuth(ctx.auth, req, res, ctx.host))) {
    return true;
  }
  const proxyReq = http.request(
    {
      hostname: '127.0.0.1',
      port: ctx.servePort,
      path: req.url,
      method: req.method,
      headers: req.headers,
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
      proxyRes.pipe(res);
    },
  );
  proxyReq.on('error', () => {
    res.writeHead(503);
    res.end('Service Unavailable');
  });
  req.pipe(proxyReq);
  return true;
};

const handleFallback = (
  ctx: RouteContext,
  req: http.IncomingMessage,
  res: http.ServerResponse,
  pathname: string,
): void => {
  const isReady = Ref.get(ctx.isReadyRef).pipe(Effect.runSync);
  if (pathname === '/') {
    res.writeHead(302, { Location: '/___status/' });
    res.end();
    return;
  }

  if (!isReady) {
    if (req.headers.accept?.includes('text/html')) {
      res.writeHead(302, {
        Location: `/___status/status.html?dest=${pathname}`,
      });
      res.end();
    } else {
      res.writeHead(404);
      res.end();
    }
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
};

export const startServer = Effect.gen(function* () {
  const { config } = yield* Config;
  const core = yield* Core;
  const output = yield* Output;
  const notifier = yield* Notifier;
  const auth = yield* Auth;
  const db = yield* Database;

  const host = config.publisherHost || '0.0.0.0';
  const port = config.publisherPort;
  const servePort = isLocalConfig(config)
    ? config.commands.serve?.port
    : undefined;
  const isReadyRef = yield* Ref.make(false);

  const ctx: RouteContext = {
    config,
    core,
    output,
    auth,
    db,
    isReadyRef,
    servePort,
    host,
  };

  yield* Effect.fork(
    Effect.gen(function* () {
      const stateHistory: ApplicationState[] = [];
      yield* Stream.runForEach(core.applicationState, (state) =>
        Effect.gen(function* () {
          yield* Ref.set(isReadyRef, state === ApplicationState.Ready);
          stateHistory.push(state);
          if (stateHistory.length > 10) {
            stateHistory.shift();
          }
          yield* notifier.stateNotify(
            [...stateHistory],
            yield* core.getBuildNumber,
          );
        }),
      );
    }),
  );

  const server = http.createServer();
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (req, socket, head) => {
    const url = req.url || '';

    if (url === '/___status/logs' || url === '/___status/updates') {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req);
      });
      return;
    }

    const isReady = Ref.get(isReadyRef).pipe(Effect.runSync);
    if (servePort && isReady) {
      const proxyReq = http.request({
        hostname: '127.0.0.1',
        port: servePort,
        path: req.url,
        headers: req.headers,
        method: req.method,
      });

      proxyReq.on('upgrade', (proxyRes, proxySocket) => {
        const headers = [`HTTP/${proxyRes.httpVersion} 101 Switching Protocols`];
        for (const [key, value] of Object.entries(proxyRes.headers)) {
          if (value) {
            headers.push(
              `${key}: ${Array.isArray(value) ? value.join(', ') : value}`,
            );
          }
        }
        socket.write(headers.join('\r\n') + '\r\n\r\n');
        proxySocket.pipe(socket);
        socket.pipe(proxySocket);
      });

      proxyReq.on('error', () => socket.destroy());
      proxyReq.end();
      return;
    }

    socket.destroy();
  });

  wss.on('connection', (ws: WebSocket, req) => {
    const url = req.url || '';

    if (url === '/___status/logs') {
      const fiber = Effect.runFork(
        Stream.runForEach(output.stream, (chunk) =>
          Effect.sync(() => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(
                `${new Date().toISOString().substring(11, 19)} ${chunk}`,
              );
            }
          }),
        ),
      );
      ws.on('close', () => Effect.runFork(Fiber.interrupt(fiber)));
    }

    if (url === '/___status/updates') {
      const fiber = Effect.runFork(
        Stream.runForEach(core.applicationState, (state) =>
          Effect.sync(() => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify(state));
            }
          }),
        ),
      );
      ws.on('close', () => Effect.runFork(Fiber.interrupt(fiber)));
    }
  });

  const setCommonHeaders = (res: http.ServerResponse): void => {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Referrer-Policy', 'no-referrer');
    const corsOrigin = config.corsOptions?.origin
      ? config.corsOptions.origin.join(', ')
      : '*';
    res.setHeader('Access-Control-Allow-Origin', corsOrigin);
    if (config.corsOptions?.credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    for (const [key, value] of config.responseHeaders || new Map()) {
      res.setHeader(key, value);
    }
  };

  const handleRequest = async (
    req: http.IncomingMessage,
    res: http.ServerResponse,
  ): Promise<void> => {
    setCommonHeaders(res);

    const url = new URL(req.url || '/', `http://${host}:${port}`);
    const pathname = url.pathname;
    const method = req.method || 'GET';

    if (method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      });
      res.end();
      return;
    }

    if (await handleStatusRoutes(ctx, req, res, pathname, method)) {
      return;
    }
    if (method === 'GET' && (await handleOAuthRoutes(ctx, req, res, pathname, url))) {
      return;
    }
    if (await handleGithubWebhook(ctx, req, res, pathname, method)) {
      return;
    }
    if (await handleProxy(ctx, req, res)) {
      return;
    }
    handleFallback(ctx, req, res, pathname);
  };

  server.on('request', (req, res) => {
    handleRequest(req, res).catch((err) => {
      console.error('Request handler error:', err);
      if (!res.headersSent) {
        res.writeHead(500);
      }
      res.end('Internal Server Error');
    });
  });

  yield* Effect.async<void>((resume) => {
    server.listen(port, host, () => {
      console.log(`Server started on http://${host}:${port}`);
      resume(Effect.void);
    });
  });

  return {
    server,
    terminate: Effect.async<void>((resume) => {
      wss.close();
      server.close(() => {
        resume(Effect.void);
      });
    }),
  };
});
