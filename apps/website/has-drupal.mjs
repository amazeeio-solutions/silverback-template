import pkgJson from './package.json' assert { type: 'json' };

if (pkgJson.dependencies['@custom/cms']) {
  process.exit(0);
}
process.exit(1);
