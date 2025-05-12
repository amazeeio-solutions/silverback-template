import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import {
  Express,
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from 'express';
import session from 'express-session';
import createMemoryStore from 'memorystore';
import fetch from 'node-fetch';
import { AccessToken, AuthorizationCode } from 'simple-oauth2';

import { getConfig } from './config.js';

declare module 'express-session' {
  interface SessionData {
    tokenString: string;
    state: string;
  }
}

// In seconds
export const SESSION_MAX_AGE = 60 * 60 * 12;

const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');

/**
 * Returns the Authorization Code middleware.
 *
 * This should be favoured in most cases when using OAuth2.
 */
export const oAuth2AuthCodeMiddleware: RequestHandler = ((): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Drupal's OAuth can be skipped if there is a valid preview link token. The
    // preview link token can either be sent as a query parameter or be stored
    // in a cookie.
    const { preview_access_token: preview_access_token_query } = req.query;
    const { preview_access_token: preview_access_token_cookie } = req.cookies;
    const preview_access_token =
      preview_access_token_query || preview_access_token_cookie;
    if (preview_access_token) {
      const config = getConfig();
      const previewAccess = await fetch(
        `${config.drupalHost}/preview/link-access`,
        {
          method: 'POST',
          body: JSON.stringify({
            preview_access_token: preview_access_token,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      // Skip, otherwise continue with OAuth.
      if (previewAccess.status === 200) {
        return next();
      }
    }

    if (await isAuthenticated(req)) {
      const accessPreview = await hasPreviewAccess(req);
      if (accessPreview) {
        return next();
      } else {
        res
          .status(403)
          .send(
            'Your user account does not have Preview access. You might contact your site administrator.',
          );
      }
    } else {
      res.cookie('origin', req.originalUrl).redirect('/oauth');
    }
  };
})();

export const initializeSession = (server: Express): void => {
  const oAuth2Config = getConfig().oAuth2;
  if (!oAuth2Config) {
    throw new Error('Missing OAuth2 configuration.');
  }
  server.use(cookieParser());

  const sessionMaxAgeInMilliseconds = SESSION_MAX_AGE * 1000;
  const MemoryStore = createMemoryStore(session);

  const config: Parameters<typeof session>[0] = {
    secret:
      oAuth2Config.sessionSecret || crypto.randomBytes(64).toString('hex'),
    resave: true, // seems to be needed for MemoryStore
    saveUninitialized: false,
    cookie: { maxAge: sessionMaxAgeInMilliseconds },
    // Keep it simple, use production safe memory store,
    // not the one provided by express-session.
    // Other available stores
    // https://expressjs.com/en/resources/middleware/session.html#compatible-session-stores
    store: new MemoryStore({
      checkPeriod: sessionMaxAgeInMilliseconds, // prune expired entries
    }),
  };

  if (oAuth2Config.environmentType === 'production') {
    server.set('trust proxy', 1); // trust first proxy
    config.cookie.secure = true; // serve secure cookies
  }

  server.use(session(config));
};

export const oAuth2AuthorizationCodeClient = (): AuthorizationCode | null => {
  const oAuth2Config = getConfig().oAuth2;
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

export const persistAccessToken = (token: AccessToken, req: Request): void => {
  req.session.tokenString = encrypt(JSON.stringify(token));
};

export const getPersistedAccessToken = (req: Request): AccessToken | null => {
  const client = oAuth2AuthorizationCodeClient();
  if (!client) {
    throw new Error('Missing OAuth2 client.');
  }
  if (req.session.tokenString) {
    const decryptedToken = decrypt(req.session.tokenString);
    if (!decryptedToken) {
      throw new Error('Failed to decrypt token.');
    }
    return client.createToken(JSON.parse(decryptedToken));
  } else {
    return null;
  }
};

const encrypt = (text: string): string => {
  if (!ENCRYPTION_KEY) {
    throw new Error('Missing encryption key.');
  }

  const oAuth2Config = getConfig().oAuth2;
  if (!oAuth2Config) {
    throw new Error('Missing OAuth2 configuration.');
  }

  try {
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    throw new Error('Encryption failed.');
  }
};

const decrypt = (encryptedText: string): string => {
  if (!ENCRYPTION_KEY) {
    throw new Error('Missing encryption key.');
  }

  try {
    const textParts = encryptedText.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    throw new Error('Decryption failed.');
  }
};

export const getOAuth2AuthorizeUrl = (
  client: AuthorizationCode,
  req: Request,
): string => {
  const oAuth2Config = getConfig().oAuth2;
  if (!oAuth2Config) {
    throw new Error('Missing OAuth2 configuration.');
  }

  const state = crypto.randomBytes(32).toString('hex');
  persistState(state, req);
  const encodedState = Buffer.from(state).toString('base64');
  return client.authorizeURL({
    // Set on the OAuth2 provider.
    //redirect_uri: callbackUrl,
    // https://auth0.com/docs/secure/attack-protection/state-parameters
    state: encodedState,
  });
};

export const persistState = (state: string, req: Request): void => {
  req.session.state = state;
};

export const stateMatches = (req: Request): boolean => {
  const persistedState = req.session.state;
  if (persistedState === undefined) {
    return false;
  }
  const encodedState = req.query.state as string;
  if (encodedState === undefined) {
    return false;
  }
  const decodedState = Buffer.from(encodedState, 'base64').toString('ascii');
  return persistedState === decodedState;
};

export const isAuthenticated = async (req: Request): Promise<boolean> => {
  const oAuth2Config = getConfig().oAuth2;
  if (!oAuth2Config) {
    throw new Error('Missing OAuth2 configuration.');
  }

  let result = false;
  let accessToken = getPersistedAccessToken(req);
  if (accessToken) {
    if (!accessToken.expired()) {
      result = true;
    } else {
      try {
        accessToken = await accessToken.refresh();
        persistAccessToken(accessToken, req);
        result = true;
      } catch (error) {
        console.error('Error refreshing access token: ', error);
      }
    }
  } else {
    console.log('No access token.');
  }

  return result;
};

export const hasPreviewAccess = async (req: Request): Promise<boolean> => {
  const oAuth2Config = getConfig().oAuth2;
  if (!oAuth2Config) {
    throw new Error('Missing OAuth2 configuration.');
  }

  const accessToken = getPersistedAccessToken(req);
  if (!accessToken) {
    throw new Error('Missing access token.');
  }

  const previewAccess = await fetch(
    `${oAuth2Config.tokenHost}/preview/access`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken.token.access_token}`,
      },
    },
  );

  const status = await previewAccess.status;
  return status === 200;
};

/**
 * User info.
 *
 * Can be used for debugging purposes.
 */
export const getUserInfo = async (req: Request): Promise<boolean> => {
  const accessToken = getPersistedAccessToken(req);
  if (!accessToken) {
    throw new Error('Missing access token.');
  }
  try {
    const userInfoResponse = await fetch(
      'http://127.0.0.1:8888/oauth/userinfo',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken.token.access_token}`,
        },
      },
    );
    const status = await userInfoResponse.status;
    console.debug('User info status', status);
    if (status === 200) {
      const json = await userInfoResponse.json();
      console.debug('User info', json);
    }
    return status === 200;
  } catch (error) {
    console.error('Error fetching user info', error);
  }

  return false;
};
