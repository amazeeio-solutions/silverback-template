import crypto from 'crypto';
import { Context, Effect, Layer } from 'effect';
import {
  AccessToken,
  AuthorizationCode,
  ModuleOptions,
  ResourceOwnerPassword,
} from 'simple-oauth2';

import { OAuth2GrantTypes } from '../tools/oAuth2GrantTypes';
import { Config } from './Config';
import { SessionStore } from './SessionStore';

const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');

const encrypt = (text: string): string => {
  const iv = crypto.randomBytes(16);
  const key = crypto
    .createHash('sha256')
    .update(ENCRYPTION_KEY)
    .digest('base64')
    .substring(0, 32);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

const decrypt = (encryptedText: string): string => {
  const textParts = encryptedText.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedData = Buffer.from(textParts.join(':'), 'hex');
  const key = crypto
    .createHash('sha256')
    .update(ENCRYPTION_KEY)
    .digest('base64')
    .substring(0, 32);
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  const decrypted = decipher.update(encryptedData);
  const decryptedText = Buffer.concat([decrypted, decipher.final()]);
  return decryptedText.toString();
};

export type AuthResult =
  | { type: 'ok' }
  | { type: 'redirect'; url: string }
  | { type: 'forbidden'; message: string }
  | { type: 'unauthorized'; message: string };

export class Auth extends Context.Tag('Auth')<
  Auth,
  {
    readonly checkAuth: (
      sessionId: string | undefined,
      path: string,
      authorizationHeader: string | undefined,
    ) => Effect.Effect<AuthResult>;
    readonly getOAuth2AuthorizeUrl: (
      sessionId: string,
    ) => Effect.Effect<string>;
    readonly handleOAuth2Callback: (
      sessionId: string,
      code: string,
      queryState: string,
    ) => Effect.Effect<{ success: boolean; error?: string }>;
    readonly handleLogout: (sessionId: string) => Effect.Effect<void>;
    readonly isAuthenticated: (sessionId: string) => Effect.Effect<boolean>;
    readonly hasPublisherAccess: (sessionId: string) => Effect.Effect<boolean>;
    readonly requiresSession: boolean;
    readonly createSession: Effect.Effect<string>;
    readonly skipAuthentication: boolean;
  }
>() {}

export const AuthLive = Layer.effect(
  Auth,
  Effect.gen(function* () {
    const { config } = yield* Config;
    const sessionStore = yield* SessionStore;

    const skipAuthentication =
      process.env.PUBLISHER_SKIP_AUTHENTICATION === 'true';

    const oAuth2Config = config.oAuth2;
    const basicAuthConfig = config.basicAuth;

    const requiresSession =
      !!oAuth2Config &&
      oAuth2Config.grantType === OAuth2GrantTypes.AuthorizationCode;

    const getAuthCodeClient = (): AuthorizationCode | null => {
      if (!oAuth2Config) {
        return null;
      }
      return new AuthorizationCode({
        client: {
          id: oAuth2Config.clientId,
          secret: oAuth2Config.clientSecret,
        },
        auth: {
          tokenHost: oAuth2Config.tokenHost,
          tokenPath: oAuth2Config.tokenPath,
          authorizePath: oAuth2Config.authorizePath,
        },
      });
    };

    const getPersistedToken = (
      sessionId: string,
    ): Effect.Effect<AccessToken | null> =>
      Effect.gen(function* () {
        const session = yield* sessionStore.getSession(sessionId);
        if (!session?.tokenString) {
          return null;
        }
        const client = getAuthCodeClient();
        if (!client) {
          return null;
        }
        const decrypted = decrypt(session.tokenString);
        return client.createToken(JSON.parse(decrypted));
      });

    const persistToken = (
      sessionId: string,
      token: AccessToken,
    ): Effect.Effect<void> =>
      sessionStore.setSession(sessionId, {
        tokenString: encrypt(JSON.stringify(token)),
      });

    const isAuthenticated = (sessionId: string): Effect.Effect<boolean> =>
      Effect.gen(function* () {
        const token = yield* getPersistedToken(sessionId);
        if (!token) {
          return false;
        }
        if (!token.expired()) {
          return true;
        }
        const refreshed = yield* Effect.tryPromise({
          try: () => token!.refresh(),
          catch: (error) => error,
        }).pipe(Effect.option);
        if (refreshed._tag === 'Some') {
          yield* persistToken(sessionId, refreshed.value);
          return true;
        }
        return false;
      });

    const hasPublisherAccess = (sessionId: string): Effect.Effect<boolean> =>
      Effect.gen(function* () {
        const token = yield* getPersistedToken(sessionId);
        if (!token) {
          return false;
        }
        const response = yield* Effect.promise(() =>
          fetch(`${oAuth2Config!.tokenHost}/publisher/access`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token.token.access_token}`,
            },
          }),
        );
        return response.status === 200;
      });

    const checkAuth = (
      sessionId: string | undefined,
      path: string,
      authorizationHeader: string | undefined,
    ): Effect.Effect<AuthResult> =>
      Effect.gen(function* () {
        if (skipAuthentication) {
          return { type: 'ok' } as AuthResult;
        }

        if (oAuth2Config) {
          if (oAuth2Config.grantType === OAuth2GrantTypes.AuthorizationCode) {
            if (path === '/build.json') {
              return { type: 'ok' };
            }
            if (!sessionId) {
              return { type: 'redirect', url: '/oauth' };
            }
            const authed = yield* isAuthenticated(sessionId);
            if (authed) {
              const access = yield* hasPublisherAccess(sessionId);
              if (access) {
                return { type: 'ok' };
              }
              return {
                type: 'forbidden',
                message: 'Your user account does not have Publisher access.',
              };
            }
            return { type: 'redirect', url: '/oauth' };
          }

          if (
            oAuth2Config.grantType === OAuth2GrantTypes.ResourceOwnerPassword
          ) {
            const base64Auth = (authorizationHeader || '').split(' ')[1] || '';
            const [login, password] = Buffer.from(base64Auth, 'base64')
              .toString()
              .split(':');

            const moduleOptions: ModuleOptions = {
              client: {
                id: oAuth2Config.clientId,
                secret: oAuth2Config.clientSecret,
              },
              auth: {
                tokenHost: oAuth2Config.tokenHost,
                tokenPath: oAuth2Config.tokenPath,
              },
            };

            if (login && password) {
              try {
                const client = new ResourceOwnerPassword(moduleOptions);
                const accessToken = yield* Effect.promise(() =>
                  client.getToken({
                    username: login,
                    password,
                    scope: oAuth2Config.scope,
                  }),
                );
                if (accessToken) {
                  const response = yield* Effect.promise(() =>
                    fetch(`${moduleOptions.auth.tokenHost}/publisher/access`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken.token.access_token}`,
                      },
                    }),
                  );
                  if (response.status === 200) {
                    return { type: 'ok' };
                  }
                  return {
                    type: 'unauthorized',
                    message: 'Publisher authentication failed.',
                  };
                }
              } catch {
                return {
                  type: 'unauthorized',
                  message: 'OAuth2 authentication failed.',
                };
              }
            }
            return {
              type: 'unauthorized',
              message: 'Authentication required.',
            };
          }
        }

        if (basicAuthConfig) {
          const base64Auth = (authorizationHeader || '').split(' ')[1] || '';
          const [login, password] = Buffer.from(base64Auth, 'base64')
            .toString()
            .split(':');
          if (
            login === basicAuthConfig.username &&
            password === basicAuthConfig.password
          ) {
            return { type: 'ok' };
          }
          return {
            type: 'unauthorized',
            message: 'Authentication required.',
          };
        }

        return { type: 'ok' };
      });

    const getOAuth2AuthorizeUrl = (sessionId: string): Effect.Effect<string> =>
      Effect.gen(function* () {
        const client = getAuthCodeClient();
        if (!client) {
          return '/';
        }
        const state = crypto.randomBytes(32).toString('hex');
        yield* sessionStore.setSession(sessionId, { state });
        const encodedState = Buffer.from(state).toString('base64');
        return client.authorizeURL({ state: encodedState });
      });

    const handleOAuth2Callback = (
      sessionId: string,
      code: string,
      queryState: string,
    ): Effect.Effect<{ success: boolean; error?: string }> =>
      Effect.gen(function* () {
        const session = yield* sessionStore.getSession(sessionId);
        if (!session?.state) {
          return {
            success: false,
            error: 'State does not match.',
          };
        }
        const decodedState = Buffer.from(queryState, 'base64').toString(
          'ascii',
        );
        if (session.state !== decodedState) {
          return {
            success: false,
            error: 'State does not match.',
          };
        }

        const client = getAuthCodeClient();
        if (!client || !oAuth2Config) {
          return { success: false, error: 'Missing OAuth2 client.' };
        }

        const accessToken = yield* Effect.tryPromise({
          try: () =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            client.getToken({ code, scope: oAuth2Config.scope } as any),
          catch: (error) => error,
        }).pipe(
          Effect.catchAll((error) =>
            Effect.succeed(null as AccessToken | null).pipe(
              Effect.tap(() =>
                Effect.sync(() =>
                  console.error('OAuth2 callback error:', error),
                ),
              ),
            ),
          ),
        );
        if (!accessToken) {
          return { success: false, error: 'Authentication failed' };
        }
        yield* persistToken(sessionId, accessToken);
        return { success: true };
      });

    const handleLogout = (sessionId: string) =>
      sessionStore.destroySession(sessionId);

    return {
      checkAuth,
      getOAuth2AuthorizeUrl,
      handleOAuth2Callback,
      handleLogout,
      isAuthenticated,
      hasPublisherAccess,
      requiresSession,
      createSession: sessionStore.createSession,
      skipAuthentication,
    };
  }),
);
