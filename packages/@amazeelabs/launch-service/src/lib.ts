import { $, execa } from 'execa';
import pidToCwd from 'pid-cwd';
import { allPortsWithPid } from 'pid-port';
import waitOn from 'wait-on';

/**
 * Error thrown when a command fails to run.
 */
export class CommandRunError extends Error {
  constructor(
    message: string,
    public readonly command: string,
    public readonly output: string,
  ) {
    super(message);
    this.name = 'CommandRunError';
  }
}

/**
 * Find processes by port and return the working directory and pid.
 */
export async function findProcessByPort(
  port: number,
): Promise<{ dir: string; pid: number } | undefined> {
  try {
    const ports = await allPortsWithPid();
    const pid = ports.get(port);
    if (!pid) {
      return undefined;
    }

    try {
      const cwd = await pidToCwd(pid);
      return { dir: cwd, pid };
    } catch (error: unknown) {
      console.log(`Could not determine working directory for process ${pid}`);
      console.error(error);
    }
  } catch (error) {
    console.error('Error finding processes:', error);
  }
}

/**
 * Start a service.
 *
 * @returns The error that occurred, or undefined if the service was started successfully.
 */
export async function startService(
  command: string,
  resources: string[],
  timeout?: number,
  cwd?: string,
): Promise<CommandRunError | undefined> {
  const $ = execa({
    detached: true,
    stdio: 'pipe',
    shell: true,
    cwd: cwd || process.cwd(),
    reject: false,
  });

  const childProcess = $`${command}`;

  let outputData = '';

  // Capture stdout.
  childProcess.stdout?.on('data', (data) => {
    const chunk = data.toString();
    outputData += chunk;
  });

  // Capture stderr.
  childProcess.stderr?.on('data', (data) => {
    const chunk = data.toString();
    outputData += chunk;
  });

  let error: CommandRunError | undefined;

  try {
    await waitOn({
      resources,
      log: false,
      timeout,
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    error = new CommandRunError(
      `Error waiting for resources to be available:`,
      command,
      outputData,
    );
  }
  childProcess.unref();

  return error;
}

/**
 * Kill a process by it's pid.
 */
export async function killProcess(pid: number, port: number): Promise<number> {
  try {
    if (process.platform === 'win32') {
      await $`taskkill /F /PID ${pid}`;
    } else {
      process.kill(pid);
    }
    console.log(`Successfully killed process ${pid}.`);
  } catch (error) {
    console.error(`Failed to kill process ${pid}:`, error);
  }

  try {
    await waitOn({
      resources: [`tcp:localhost:${port}`],
      reverse: true,
      log: false,
      timeout: 10000,
    });
    return 0;
  } catch (error) {
    console.error(`Failed to wait for port ${port} to be free:`, error);
    return 1;
  }
}
