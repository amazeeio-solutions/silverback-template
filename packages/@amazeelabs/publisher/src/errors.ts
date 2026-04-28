import { Data } from 'effect';

export class ConfigError extends Data.TaggedError('ConfigError')<{
  message: string;
}> {}
