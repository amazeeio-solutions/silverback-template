import fs from 'node:fs';
import path from 'node:path';

import ignoreWalk from 'ignore-walk';

export function replace(
  path: string | Array<string>,
  from: RegExp | string,
  to: string,
): void {
  const paths = Array.isArray(path) ? path : [path];
  for (const path of paths) {
    if (!fs.existsSync(path)) {
      throw new Error(`File ${path} does not exist.`);
    }
    const contents = fs.readFileSync(path, 'utf8');
    if (!contents.match(from)) {
      throw new Error(`File ${path} does not contain ${from}.`);
    }
    fs.writeFileSync(path, contents.replaceAll(from, to), 'utf8');
  }
}

export function randomString(length: number): string {
  let result = '';
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

export function getArg(name: string): string | null {
  const index = process.argv.indexOf(name);
  if (index === -1) {
    return null;
  }
  if (!process.argv[index + 1]) {
    return null;
  }
  return process.argv[index + 1];
}

export function relinkSharedPackages(sharedPackagesDir: string): void {
  const sharedPackages = ignoreWalk
    .sync({
      path: sharedPackagesDir,
      ignoreFiles: ['.gitignore'],
    })
    .filter((file) => path.basename(file) === 'package.json')
    .map((file) => {
      const pkg = JSON.parse(
        fs.readFileSync(path.join(sharedPackagesDir, file), 'utf8'),
      );
      return {
        name: pkg.name as string,
        version: pkg.version as string,
      };
    });

  ignoreWalk
    .sync({
      path: process.cwd(),
      ignoreFiles: ['.gitignore'],
    })
    .filter(
      (file) =>
        path.basename(file) === 'package.json' &&
        !file.startsWith(sharedPackagesDir),
    )
    .map((file) => {
      const targetPkg = JSON.parse(fs.readFileSync(file, 'utf8'));
      let updated = false;
      for (const depType of [
        'dependencies',
        'devDependencies',
        'peerDependencies',
      ]) {
        if (targetPkg[depType]) {
          for (const pkg of sharedPackages) {
            if (targetPkg[depType][pkg.name]?.startsWith('workspace:')) {
              targetPkg[depType][pkg.name] = `^${pkg.version}`;
              updated = true;
            }
          }
        }
      }
      if (updated) {
        fs.writeFileSync(
          file,
          JSON.stringify(targetPkg, null, 2) + '\n',
          'utf8',
        );
      }
    });
}
