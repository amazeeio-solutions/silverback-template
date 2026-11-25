import * as esbuild from 'esbuild';
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const packageRoot = dirname(fileURLToPath(import.meta.url));

/**
 * Everything is bundled, so that installing publisher does not add its
 * dependency tree to the consuming project.
 *
 * The exceptions are the native addon, which cannot be bundled, and the two
 * optional native speedups `ws` probes for at runtime - `ws` catches the
 * failing require and falls back to its JavaScript implementation.
 */
const external = ['sqlite3', 'bufferutil', 'utf-8-validate'];

// Bundled CommonJS dependencies expect these to exist. They resolve to `dist`,
// which is where a CommonJS bundle would have put them too.
const banner = `import { createRequire as __createRequire } from 'module';
import { dirname as __pathDirname } from 'path';
import { fileURLToPath as __fileURLToPath } from 'url';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __pathDirname(__filename);`;

const options = {
  entryPoints: [join(packageRoot, 'src/cli.ts')],
  outfile: join(packageRoot, 'dist/cli.js'),
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node20',
  external,
  banner: { js: banner },
  metafile: true,
  logOverride: {
    // express resolves view engines through a runtime require, which stays a
    // runtime require in the bundle.
    'indirect-require': 'silent',
  },
};

const licenseFileNames = [
  'LICENSE',
  'LICENSE.md',
  'LICENSE.txt',
  'license',
  'LICENCE',
  'COPYING',
];

const readLicenseText = (packageDirectory) => {
  for (const name of licenseFileNames) {
    try {
      return readFileSync(join(packageDirectory, name), 'utf-8').trim();
    } catch {
      continue;
    }
  }
  return null;
};

const bundledPackageDirectories = (metafile) => {
  const directories = new Set();
  for (const input of Object.keys(metafile.inputs)) {
    const segments = input.split('/');
    const lastModulesIndex = segments.lastIndexOf('node_modules');
    if (lastModulesIndex === -1) {
      continue;
    }
    const nameLength = segments[lastModulesIndex + 1]?.startsWith('@') ? 2 : 1;
    directories.add(
      segments.slice(0, lastModulesIndex + 1 + nameLength).join('/'),
    );
  }
  return [...directories].sort();
};

const writeNotices = (metafile) => {
  const notices = bundledPackageDirectories(metafile).map((directory) => {
    const manifest = JSON.parse(
      readFileSync(join(directory, 'package.json'), 'utf-8'),
    );
    return {
      name: manifest.name,
      version: manifest.version,
      license: manifest.license ?? 'see below',
      text: readLicenseText(directory),
    };
  });

  const sections = notices.map(
    ({ name, version, license, text }) =>
      `## ${name} ${version}\n\nLicense: ${license}\n\n${
        text ? `\`\`\`\n${text}\n\`\`\`` : 'No license file was published.'
      }`,
  );

  writeFileSync(
    join(packageRoot, 'dist/THIRD-PARTY-NOTICES.md'),
    `# Third party notices

@amazeelabs/publisher bundles the ${notices.length} packages listed below. Their
licenses and copyright notices are reproduced verbatim.

${sections.join('\n\n')}
`,
  );

  return notices.length;
};

if (process.argv.includes('--watch')) {
  const context = await esbuild.context(options);
  await context.watch();
} else {
  const { metafile } = await esbuild.build(options);
  const count = writeNotices(metafile);
  console.log(`Bundled ${count} packages into dist/cli.js.`);
}
