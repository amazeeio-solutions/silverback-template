import { pageResolvers } from './collections/page';
import { translatableResolvers } from './collections/translatables';
import { createExecutor } from './graphql';

export const createDecapExecutor = (path: string) =>
  createExecutor([translatableResolvers(path), pageResolvers(path)]);
