import express from 'express';
import expressWs from 'express-ws';
import { Subject } from 'rxjs';

import {
  getAuthenticationMiddleware,
  isSessionRequired,
} from './utils/authentication.js';
import { getConfig } from './utils/config.js';
import {
  getOAuth2AuthorizeUrl,
  getPersistedAccessToken,
  hasPreviewAccess,
  initializeSession,
  isAuthenticated,
  oAuth2AuthorizationCodeClient,
  persistAccessToken,
  stateMatches,
} from './utils/oAuth2.js';

const expressServer = express();
const expressWsInstance = expressWs(expressServer);
const { app } = expressWsInstance;

const updates$ = new Subject();
app.use(express.json());

// A session is only needed for OAuth2.
if (isSessionRequired()) {
  initializeSession(expressServer);
}
// Authentication middleware based on the configuration.
const authMiddleware = getAuthenticationMiddleware();

app.get('/endpoint.js', (_, res) => {
  res.send(
    `window.DRUPAL_URL = ${JSON.stringify(
      process.env.DRUPAL_URL || 'http://127.0.0.1:8888',
    )};`,
  );
});

app.post('/__preview', (req, res) => {
  updates$.next(req.body || {});
  res.json(true);
});

app.ws('/__preview', (ws) => {
  // TODO: Separate updates per user session.
  const sub = updates$.subscribe((payload) => {
    ws.send(JSON.stringify(payload));
  });
  ws.on('close', sub.unsubscribe);
});

app.get('/__preview/*', authMiddleware, (req, _, next) => {
  req.url = '/';
  next();
});

// ---------------------------------------------------------------------------
// OAuth2 routes
// ---------------------------------------------------------------------------

// Fallback route for login. Is used if there is no origin cookie.
app.get('/oauth/login', async (req, res) => {
  if (await isAuthenticated(req)) {
    const accessPreview = await hasPreviewAccess(req);
    if (accessPreview) {
      res.send('Preview access is granted.');
    } else {
      res.send(
        'Preview access is not granted. Contact your site administrator. <a href="/oauth/logout">Log out</a>',
      );
    }
  } else {
    res.cookie('origin', req.path).send('<a href="/oauth">Log in</a>');
  }
});

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
app.get('/oauth/callback', async (req, res) => {
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
    return res.status(500).json('State does not match.');
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
    console.log('/oauth/callback accessToken', accessToken);
    persistAccessToken(accessToken, req);

    if (req.cookies.origin) {
      res.redirect(req.cookies.origin);
    } else {
      res.redirect('/oauth/login');
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(`Authentication failed with error: ${error.message}`);
  }
});

// Removes the session.
app.get('/oauth/logout', async (req, res) => {
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
});

app.use(express.static('./dist'));

const isLagoon = !!process.env.LAGOON;
const port = isLagoon ? 3000 : 8001;
console.log(`Server is running on port ${port}`);

app.listen({ port, host: '0.0.0.0' });
