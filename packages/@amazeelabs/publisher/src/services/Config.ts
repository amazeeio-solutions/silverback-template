import { Context, Effect, Layer } from 'effect';
import { existsSync } from 'fs';
import { join } from 'path';
import { loadSync } from 'ts-import';

import { ConfigError } from '../errors';
import { OAuth2GrantTypes } from '../tools/oAuth2GrantTypes';

type PublisherConfigBase = {
  publisherPort: number;
  publisherHost?: string;
  databaseUrl: string;
  basicAuth?: {
    username: string;
    password: string;
  };
  oAuth2?: {
    clientId: string;
    clientSecret: string;
    scope: string;
    tokenHost: string;
    tokenPath: string;
    grantType: OAuth2GrantTypes;
    authorizePath?: string;
    sessionSecret?: string;
    environmentType?: string;
  };
  corsOptions?: {
    credentials: boolean;
    origin: Array<string>;
  };
  responseHeaders?: Map<string, string>;
  slackNotifications?: {
    webhookUrl: string;
    channel: string;
    publisherBaseUrl?: string;
    projectName?: string;
    environmentName?: string;
  };
};

export type PublisherConfigLocal = PublisherConfigBase & {
  mode: 'local';
  commands: {
    clean: string;
    build: {
      command: string;
      outputTimeout?: number;
    };
    deploy?: string;
    serve?: {
      command: string;
      readyPattern: string;
      readyTimeout?: number;
      port: number;
    };
  };
};

export type PublisherConfigGithubWorkflow = PublisherConfigBase & {
  mode: 'github-workflow';
  publisherBaseUrl: string;
  workflow: string;
  repo: string;
  ref: string;
  environment: string;
  environmentVariables?: Record<string, string>;
  inputs?: Record<string, string>;
  workflowTimeout: number;
  cleanBuildOnStart?: boolean;
};

export type PublisherConfig =
  | PublisherConfigLocal
  | PublisherConfigGithubWorkflow;

export const isLocalConfig = (
  config: PublisherConfig,
): config is PublisherConfigLocal => config.mode === 'local';

export class Config extends Context.Tag('Config')<
  Config,
  { readonly config: PublisherConfig }
>() {}

const applySlackEnvDefaults = (config: PublisherConfig): PublisherConfig => {
  if (
    !config.slackNotifications &&
    process.env.PUBLISHER_SLACK_WEBHOOK &&
    process.env.PUBLISHER_SLACK_CHANNEL
  ) {
    return {
      ...config,
      slackNotifications: {
        webhookUrl: process.env.PUBLISHER_SLACK_WEBHOOK,
        channel: process.env.PUBLISHER_SLACK_CHANNEL,
        publisherBaseUrl: process.env.PUBLISHER_URL || undefined,
        projectName: process.env.LAGOON_PROJECT || undefined,
        environmentName: process.env.LAGOON_ENVIRONMENT || undefined,
      },
    } as PublisherConfig;
  }
  return config;
};

export const ConfigLive = Layer.effect(
  Config,
  Effect.try({
    try: () => {
      const configPath = join(process.cwd(), 'publisher.config.ts');
      if (!existsSync(configPath)) {
        throw new ConfigError({
          message: `Publisher config not found: ${configPath}`,
        });
      }
      const config = loadSync(configPath, {
        compiledJsExtension: '.cjs',
      }).default as PublisherConfig;
      return { config: applySlackEnvDefaults(config) };
    },
    catch: (error) =>
      new ConfigError({
        message:
          error instanceof ConfigError
            ? error.message
            : `Failed to load config: ${error}`,
      }),
  }),
);

export const ConfigTest = (config: PublisherConfig) =>
  Layer.succeed(Config, { config: applySlackEnvDefaults(config) });

export const localConfig: Effect.Effect<PublisherConfigLocal, never, Config> =
  Effect.gen(function* () {
    const { config } = yield* Config;
    if (!isLocalConfig(config)) {
      return yield* Effect.die('Expected local config but got: ' + config.mode);
    }
    return config;
  });
