/**
 * Lagoon restarts the pod whenever the process exits, so an exit is a denial of
 * service. Node terminates on an unhandled rejection or an uncaught exception
 * unless a listener takes responsibility for it, so these guards downgrade a
 * stray failure to a log line and let the server keep serving.
 */

const reportRejection = (reason: unknown): void => {
  console.error('Unhandled promise rejection:', reason);
};

const reportException = (error: Error): void => {
  console.error('Uncaught exception:', error);
};

export const installCrashGuards = (): void => {
  if (!process.listeners('unhandledRejection').includes(reportRejection)) {
    process.on('unhandledRejection', reportRejection);
  }
  if (!process.listeners('uncaughtException').includes(reportException)) {
    process.on('uncaughtException', reportException);
  }
};

/**
 * Kubernetes sends SIGTERM on a rollout and SIGINT is what a terminal sends, so
 * both have to drain the server and stop the child processes. Further signals
 * while a shutdown is already running are ignored, because starting a second one
 * would terminate the first mid-flight.
 */
export const installShutdownHandlers = (
  shutdown: () => Promise<void>,
): void => {
  let shuttingDown = false;
  const handle = async (): Promise<void> => {
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;
    try {
      await shutdown();
    } catch (error) {
      console.error('Shutdown failed:', error);
    }
    process.exit();
  };
  process.on('SIGINT', handle);
  process.on('SIGTERM', handle);
};
