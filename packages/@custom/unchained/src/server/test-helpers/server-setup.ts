import { type Server } from 'node:http';

import type { GraphQLRequestListener } from '@apollo/server';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import session from 'express-session';
import { createRequire } from 'module';

import { type Context, resolvers } from '../resolvers/index.js';
import { typeDefs } from '../schema.js';
import type { CustomRequest } from '../types.js';

const require = createRequire(import.meta.url);
const MemoryStore = require('memorystore')(session);

export interface TestServerInstance {
  app: Express;
  server: Server;
  apollo: ApolloServer<Context>;
  port: number;
  url: string;
}

/**
 * Creates and starts a test server instance for integration testing
 */
export async function createTestServer(): Promise<TestServerInstance> {
  // Create Express app
  const app = express();

  // Session configuration
  app.use(
    session({
      store: new MemoryStore({
        checkPeriod: 86400000, // Prune expired entries every 24h
      }),
      secret: 'test-secret',
      resave: false,
      saveUninitialized: true,
      cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    }),
  );

  app.use(cookieParser());

  // Request logging middleware for test debugging
  app.use((req, res, next) => {
    const start = Date.now();
    const timestamp = new Date().toISOString();

    console.log(`[${timestamp}] ${req.method} ${req.path}`);

    // Log response when finished
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(
        `[${timestamp}] ${req.method} ${req.path} → ${res.statusCode} (${duration}ms)`,
      );
    });

    next();
  });

  // Create Apollo Server
  const apollo = new ApolloServer<Context>({
    typeDefs,
    resolvers,
    introspection: true,
    plugins: [
      // Custom plugin for logging GraphQL operations
      {
        async requestDidStart(): Promise<GraphQLRequestListener<Context>> {
          return {
            async didResolveOperation(requestContext) {
              const { operationName, request } = requestContext;
              console.log(
                `  🔍 GraphQL Operation: ${operationName || 'unnamed'}`,
              );

              // Log variables if present
              if (
                request.variables &&
                Object.keys(request.variables).length > 0
              ) {
                console.log(
                  `  📝 Variables: ${JSON.stringify(request.variables, null, 2)}`,
                );
              }
            },

            async willSendResponse(requestContext) {
              const { response } = requestContext;
              if (response.body.kind === 'single') {
                if (response.body.singleResult.errors) {
                  console.log(
                    `  ❌ GraphQL Errors: ${response.body.singleResult.errors.map((e: { message: string }) => e.message).join(', ')}`,
                  );
                } else {
                  console.log(`  ✅ GraphQL Success`);
                }
              }
            },
          };
        },
      },
    ],
  });

  await apollo.start();

  // Apply middleware
  app.use(
    '/graphql',
    cors<cors.CorsRequest>({
      origin: true, // Allow all origins in tests
      credentials: true,
    }),
    express.json({ limit: '50mb' }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expressMiddleware(apollo, {
      context: async ({ req, res }): Promise<Context> => {
        const customReq = req as unknown as CustomRequest;
        return {
          req: customReq,
          res: res as any, // eslint-disable-line @typescript-eslint/no-explicit-any
          sessionId: customReq.session?.guestId,
        };
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any,
  );

  // Health check endpoint
  app.get('/health', (_, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'unchained-mock-api',
    });
  });

  // Root endpoint
  app.get('/', (_, res) => {
    res.json({
      message: 'Unchained Commerce Mock API',
      graphql: '/graphql',
      health: '/health',
    });
  });

  // Start server on dynamic port (0 = find available port)
  const server = app.listen(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const port = (server.address() as any)?.port;
  const url = `http://localhost:${port}`;

  console.log(`🧪 Test server started at ${url}`);
  console.log(`📊 GraphQL endpoint: ${url}/graphql`);

  return {
    app,
    server,
    apollo,
    port,
    url,
  };
}

/**
 * Stops and cleans up a test server instance
 */
export async function stopTestServer(
  instance: TestServerInstance,
): Promise<void> {
  console.log(`🧪 Stopping test server at ${instance.url}`);
  await instance.apollo.stop();

  return new Promise((resolve) => {
    instance.server.close(() => {
      console.log(`🧪 Test server stopped`);
      resolve();
    });
  });
}

/**
 * Utility to ensure clean server shutdown in tests
 */
export function withTestServer() {
  let serverInstance: TestServerInstance | null = null;

  return {
    async start(): Promise<TestServerInstance> {
      if (serverInstance) {
        throw new Error('Server instance already exists');
      }
      serverInstance = await createTestServer();
      return serverInstance;
    },

    async stop(): Promise<void> {
      if (serverInstance) {
        await stopTestServer(serverInstance);
        serverInstance = null;
      }
    },

    get instance(): TestServerInstance {
      if (!serverInstance) {
        throw new Error('Server instance not started');
      }
      return serverInstance;
    },
  };
}
