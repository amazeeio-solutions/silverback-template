import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import { createRequire } from 'module';

import { type Context, resolvers } from './resolvers/index.js';
import { typeDefs } from './schema.js';
import type { CustomRequest } from './types.js';

const require = createRequire(import.meta.url);
const MemoryStore = require('memorystore')(session);

async function startServer() {
  // Create Express app
  const app = express();

  // Session configuration
  app.use(
    session({
      store: new MemoryStore({
        checkPeriod: 86400000, // Prune expired entries every 24h
      }),
      secret: process.env.SESSION_SECRET || 'unchained-demo-secret',
      resave: false,
      saveUninitialized: true,
      cookie: {
        secure: false, // Set to true in production with HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    }),
  );

  app.use(cookieParser());

  // Create Apollo Server
  const server = new ApolloServer<Context>({
    typeDefs,
    resolvers,
    // Enable GraphQL Playground in development
    introspection: true,
  });

  await server.start();

  // Apply middleware
  app.use(
    '/graphql',
    cors<cors.CorsRequest>({
      origin: [
        'http://localhost:3000',
        'http://localhost:8000',
        'http://localhost:8001',
      ],
      credentials: true,
    }),
    express.json({ limit: '50mb' }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expressMiddleware(server, {
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

  const PORT = process.env.PORT || 8080;
  const HOST = process.env.HOST || 'localhost';

  app.listen(PORT, () => {
    console.log(
      `🚀 Unchained Commerce Mock API running at http://${HOST}:${PORT}`,
    );
    console.log(`📊 GraphQL endpoint: http://${HOST}:${PORT}/graphql`);
    console.log(`🔍 GraphQL Playground: http://${HOST}:${PORT}/graphql`);
  });
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
