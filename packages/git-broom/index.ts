#!/usr/bin/env tsx
import { $, cd, echo, fs, ProcessOutput, question } from 'zx';

$.verbose = true;

try {
  const repoRoot = await $`git rev-parse --show-toplevel`;
  cd(repoRoot);

  const untrackedFiles = await $`git clean -dfn`;
  if (untrackedFiles.toString().trim() !== '') {
    const answer = await question(
      'The above untracked files would be deleted. Continue? (y/n) ',
    );
    if (answer !== 'y') {
      console.log('Aborting.');
      process.exit(1);
    }
  }

  const ignore =
    fs.existsSync('.gitbroomignore') && fs.statSync('.gitbroomignore').isFile()
      ? fs
          .readFileSync('.gitbroomignore', 'utf8')
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line && !line.startsWith('#'))
      : ['/_local', '/.idea'];

  if (ignore.length > 0) {
    await $`git clean -dxff ${ignore.flatMap((item) => ['-e', item])}`;
  } else {
    await $`git clean -dxff`;
  }
} catch (error) {
  if (error instanceof ProcessOutput) {
    echo('^ The above command failed');
    process.exit(error.exitCode || 1);
  } else {
    console.error(error);
    process.exit(1);
  }
}
