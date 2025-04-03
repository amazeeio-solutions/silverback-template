import { spawn } from 'node:child_process';
import path from 'node:path';

import getPort from 'get-port';
import waitOn from 'wait-on';

// TODO: move this to the cms package?
async function start() {
  const cwd = path.resolve('../../apps/cms/web');
  const port = await getPort();
  const uri = `http://127.0.0.1:${port}`;
  console.log(`Starting test server on port ${port}`);
  try {
    const serverProcess = spawn(
      'php',
      ['-S', `0.0.0.0:${port}`, '.ht.router.php'],
      {
        cwd: cwd,
        detached: false,
        env: {
          ...process.env,
          SB_ENVIRONMENT: '1',
          SIMPLETEST_DB: 'sqlite://localhost/sites/default/files/.sqlite',
          DRUSH_OPTIONS_URI: uri,
        },
      },
    );
    serverProcess.on('error', console.error);
    await waitOn({ resources: [uri] });
    console.log('Test server started');
    return {
      uri,
      shutdown: async () => {
        console.log('Shutting down test server');
        serverProcess.kill('SIGTERM');
        await waitOn({ resources: [uri], reverse: true });
      },
    };
  } catch (exc) {
    console.error(exc);
  }
}

export default async function () {
  const serve = await start();

  process.env.TEST_URI = serve?.uri;
  return serve?.shutdown;
}
