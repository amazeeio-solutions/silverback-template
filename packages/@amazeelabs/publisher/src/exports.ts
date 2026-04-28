import { PublisherConfig } from './services/Config';

export { OAuth2GrantTypes } from './tools/oAuth2GrantTypes';
export type {
  PublisherConfig,
  PublisherConfigLocal,
  PublisherConfigGithubWorkflow,
} from './services/Config';

export const defineConfig = (config: PublisherConfig): PublisherConfig =>
  config;
