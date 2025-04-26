import { Command } from 'commander';

import { findProcessByPort, killProcess, startService } from './lib.js';

export function run(args?: string[]): void {
  const program = new Command();

  program
    .name('launch-service')
    .description('Launch service command line tool');

  program
    .command('start')
    .description('Start the service')
    .argument('<command>', 'The service command to run')
    .argument(
      '<port>',
      'Port that the service will use (needed for monitoring)',
    )
    .option(
      '-r, --resources <resources>',
      'Additional resources to check (e.g., "http://localhost:3000/health")',
      [],
    )
    .option(
      '-t, --timeout <timeout>',
      'Timeout to wait for the service to become available in milliseconds.',
      '30000',
    )
    .action(
      async (
        script: string,
        port: string,
        options: { resources: string[]; timeout: string },
      ) => {
        const portNumber = parseInt(port, 10);
        const timeout = parseInt(options.timeout, 10);

        // Check if the port is already in use
        const existingProcess = await findProcessByPort(portNumber);
        if (existingProcess) {
          if (process.cwd() === existingProcess.dir) {
            console.log(
              `Service already running on port ${port} in the current directory. Doing nothing.`,
            );
            return;
          } else {
            console.log(
              `Found processes using port ${port} in ${existingProcess.dir}. Attempting to kill...`,
            );
            await killProcess(existingProcess.pid, portNumber);
          }
        }
        console.log(
          `Starting service "${script}" that will be available on port ${port}...`,
        );
        const error = await startService(
          script,
          [`tcp:localhost:${portNumber}`, ...options.resources],
          timeout,
          process.cwd(),
        );

        if (error) {
          console.error(`Failed to start script "${script}".`);
          console.error(`Process output: ${error.output}`);
          process.exit(1);
        } else {
          console.log(`Service "${script}" started on port ${portNumber}.`);
          process.exit(0);
        }
      },
    );

  program
    .command('stop')
    .description('Stop the service')
    .argument('<port>', 'Port of the service to stop')
    .action(async (port: string) => {
      const portNumber = parseInt(port, 10);

      const processAtPort = await findProcessByPort(portNumber);

      if (!processAtPort) {
        console.log(`No service is running on port ${port}. Nothing to stop.`);
        return;
      }

      console.log(`Stopping service running on port ${port}...`);

      process.exit(await killProcess(processAtPort.pid, portNumber));
    });

  program.parse(args || process.argv);
}
