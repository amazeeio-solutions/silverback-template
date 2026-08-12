import { Observable } from 'rxjs';

import { core as coreGithubWorkflow } from '../mode-github-workflow/core';
import { core as coreLocal } from '../mode-local/core';
import { ApplicationState } from '../shared/exports';
import { getConfig } from './config';
import { OutputSubject } from './output';

export type Core = {
  state: {
    applicationState$: Observable<ApplicationState>;
  };
  output$: OutputSubject;
  start: () => void;
  stop: () => Promise<void>;
  build: () => void;
  clean: () => Promise<void>;
  getBuildNumber: () => number;
};

export type CoreGithubWorkflow = typeof coreGithubWorkflow;

let instance: Core | null = null;

const resolveCore = (): Core => {
  if (!instance) {
    const mode = getConfig().mode;
    if (mode === 'local') {
      instance = coreLocal;
    } else if (mode === 'github-workflow') {
      instance = coreGithubWorkflow;
    } else {
      throw new Error(`Unsupported mode: ${mode}`);
    }
  }
  return instance;
};

/**
 * Delegates to the core of the configured mode.
 *
 * The mode is only known once the config is loaded, which happens after this
 * module is imported, so the implementation is resolved on first use.
 */
export const core: Core = {
  get state() {
    return resolveCore().state;
  },
  get output$() {
    return resolveCore().output$;
  },
  start: () => resolveCore().start(),
  stop: () => resolveCore().stop(),
  build: () => resolveCore().build(),
  clean: () => resolveCore().clean(),
  getBuildNumber: () => resolveCore().getBuildNumber(),
};
