import fs from 'node:fs';

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
