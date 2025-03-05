import { defineConfig } from '@amazeelabs/publisher';

const isLagoon = !!process.env.LAGOON;

const base = {
  databaseUrl: '/tmp/publisher.sqlite',
  publisherPort: isLagoon ? 3000 : 8000,
  oAuth2: isLagoon
    ? {
        clientId: process.env.PUBLISHER_OAUTH2_CLIENT_ID || 'publisher',
        clientSecret: process.env.PUBLISHER_OAUTH2_CLIENT_SECRET || 'publisher',
        sessionSecret: process.env.PUBLISHER_OAUTH2_SESSION_SECRET || 'banana',
        tokenHost:
          process.env.PUBLISHER_OAUTH2_TOKEN_HOST || 'http://127.0.0.1:8888',
        environmentType:
          process.env.PUBLISHER_OAUTH2_ENVIRONMENT_TYPE || 'development',
        scope: 'publisher',
        tokenPath: '/oauth/token',
        authorizePath: '/oauth/authorize?response_type=code',
        grantType: 0,
      }
    : undefined,
};

export default defineConfig(
  isLagoon
    ? {
        ...base,
        mode: 'github-workflow',
        publisherBaseUrl: `https://${process.env.SERVICE_NAME}.${process.env.LAGOON_ENVIRONMENT}.${process.env.LAGOON_PROJECT}.${process.env.LAGOON_KUBERNETES}`,
        workflow: 'fe_build.yml',
        repo: 'AmazeeLabs/silverback-template',
        ref: process.env.LAGOON_GIT_BRANCH!,
        environment: process.env.LAGOON_GIT_BRANCH!,
        environmentVariables: githubEnvVars(),
        inputs: {
          env: process.env.LAGOON_GIT_BRANCH!,
        },
        workflowTimeout: 1000 * 60 * 30,
      }
    : {
        ...base,
        mode: 'local',
        commands: {
          build: {
            command:
              'cd ../website && DRUPAL_EXTERNAL_URL=http://127.0.0.1:8888 pnpm build:gatsby',
          },
          clean: 'pnpm clean',
          serve: {
            command:
              'cd ../website && pnpm netlify dev --cwd=. --dir=public --port=7999',
            readyPattern: 'Server now ready',
            readyTimeout: 1000 * 60,
            port: 7999,
          },
        },
      },
);

function githubEnvVars(): Record<string, string> {
  return Object.fromEntries(
    [
      'DRUPAL_INTERNAL_URL',
      'DRUPAL_EXTERNAL_URL',
      'NETLIFY_URL',
      'NETLIFY_SITE_ID',
      'NETLIFY_AUTH_TOKEN',
      'PUBLISHER_SKIP_AUTHENTICATION',
      'PUBLISHER_OAUTH2_CLIENT_SECRET',
      'PUBLISHER_OAUTH2_CLIENT_ID',
      'PUBLISHER_OAUTH2_SESSION_SECRET',
      'PUBLISHER_OAUTH2_ENVIRONMENT_TYPE',
      'PUBLISHER_OAUTH2_TOKEN_HOST',
      'VITE_DECAP_REPO',
      'VITE_DECAP_BRANCH',
      // For Publisher Slack notifications.
      'PUBLISHER_SLACK_WEBHOOK',
      'PUBLISHER_SLACK_CHANNEL',
      'PUBLISHER_URL',
      'LAGOON_PROJECT',
      'LAGOON_ENVIRONMENT',
    ].map((name) => {
      if (name === 'DRUPAL_INTERNAL_URL') {
        // No internal URLs when building on Github.
        return ['DRUPAL_INTERNAL_URL', process.env.DRUPAL_EXTERNAL_URL || ''];
      }
      return [name, process.env[name] || ''];
    }),
  );
}
