import fs from 'node:fs';

import prompt from 'prompts';

import { getArg, randomString, relinkSharedPackages, replace } from './lib';

// Switch to the project root.
process.chdir('../..');

// Get user input.
const PROJECT_NAME_HUMAN =
  getArg('--project-human-name') ||
  (
    await prompt({
      name: 'value',
      type: 'text',
      message: 'Project name for humans:',
      validate: (name) => (!/^.+$/.test(name) ? 'Must be not empty.' : true),
      initial: 'My Project',
    })
  ).value;
const PROJECT_NAME_MACHINE =
  getArg('--project-machine-name') ||
  (
    await prompt({
      name: 'value',
      type: 'text',
      message:
        'Project name for machines (usually a lowercase version of Jira project code):',
      validate: (name) =>
        !/^[a-z][a-z\d_]*$/.test(name)
          ? 'Must start with a lowercase letter and contain lowercase letters, numbers and underscores only.'
          : true,
      initial: 'my_project',
    })
  ).value;
if (!PROJECT_NAME_HUMAN || !PROJECT_NAME_MACHINE) {
  // Because ctrl+c on prompt does not stop the script.
  console.error('Cancelled');
  process.exit(1);
}

// Adjust project name in the repo.
replace('README.md', '# Silverback Template', '# ' + PROJECT_NAME_HUMAN);
replace(
  [
    'apps/cms/config/sync/system.site.yml',
    'tests/schema/specs/content.spec.ts',
    'tests/e2e/specs/drupal/metatags.spec.ts',
  ],
  'Silverback Drupal Template',
  PROJECT_NAME_HUMAN,
);
replace(
  'apps/cms/config/sync/slack.settings.yml',
  'Silverback Template Bot',
  PROJECT_NAME_HUMAN + ' Bot',
);

// Adjust project machine name in the repo.
replace(
  [
    '.lagoon.yml',
    'README.md',
    '.lagoon/Dockerfile',
    'apps/cms/config/sync/system.site.yml',
    'apps/cms/config/sync/slack.settings.yml',
    'apps/cms/scaffold/settings.php.append.txt',
    'apps/publisher/publisher.config.ts',
  ],
  'silverback-template',
  PROJECT_NAME_MACHINE,
);
replace(
  'package.json',
  '@amazeelabs/silverback-template',
  PROJECT_NAME_MACHINE,
);
replace(
  [
    'apps/cms/.lagoon.env',
    'apps/publisher/.lagoon.env',
    'apps/preview/.lagoon.env',
  ],
  'PROJECT_NAME=example',
  'PROJECT_NAME=' + PROJECT_NAME_MACHINE,
);
const publisherClientSecret = randomString(32);
replace(
  ['apps/cms/.lagoon.env', 'apps/publisher/.lagoon.env'],
  'PUBLISHER_OAUTH2_CLIENT_SECRET=REPLACE_ME',
  'PUBLISHER_OAUTH2_CLIENT_SECRET=' + publisherClientSecret,
);
const publisherSessionSecret = randomString(32);
replace(
  ['apps/publisher/.lagoon.env'],
  'PUBLISHER_OAUTH2_SESSION_SECRET=REPLACE_ME',
  'PUBLISHER_OAUTH2_SESSION_SECRET=' + publisherSessionSecret,
);
const previewClientSecret = randomString(32);
replace(
  ['apps/cms/.lagoon.env'],
  'PREVIEW_OAUTH2_CLIENT_SECRET=REPLACE_ME',
  'PREVIEW_OAUTH2_CLIENT_SECRET=' + previewClientSecret,
);
replace(
  ['apps/preview/.lagoon.env'],
  'OAUTH2_CLIENT_SECRET=REPLACE_ME',
  'OAUTH2_CLIENT_SECRET=' + previewClientSecret,
);
const previewSessionSecret = randomString(32);
replace(
  ['apps/preview/.lagoon.env'],
  'OAUTH2_SESSION_SECRET=REPLACE_ME',
  'OAUTH2_SESSION_SECRET=' + previewSessionSecret,
);
// Template's prod domain is special.
replace('.lagoon.yml', '- example.', '- prod-' + PROJECT_NAME_MACHINE + '.');
// The rest of domains are standard.
replace('.lagoon.yml', '-example.', '-' + PROJECT_NAME_MACHINE + '.');

// Update the auth key for Gatsby user.
const authKey = randomString(32);
replace(
  'apps/cms/gatsby-config.mjs',
  "auth_key: 'cfdb0555111c0f8924cecab028b53474'",
  `auth_key: '${authKey}'`,
);
replace(
  'packages/drupal/test_content/content/user/f20d961b-ba45-4820-b2cc-166e5ce56815.yml',
  'value: cfdb0555111c0f8924cecab028b53474',
  `value: ${authKey}`,
);
replace(
  'tests/schema/lib.ts',
  "'api-key': 'cfdb0555111c0f8924cecab028b53474'",
  `'api-key': '${authKey}'`,
);

// Update the default hash salt.
replace(
  'apps/cms/scaffold/settings.php.append.txt',
  'time-flies-like-an-arrow-fruit-flies-like-a-banana',
  randomString(32),
);

// Cleanup the readme.
replace(
  'README.md',
  /## Create a new project from this template.+?## /gs,
  '## ',
);

// Remove e2e tests.
const e2ePackage = 'tests/e2e';
if (!fs.existsSync(e2ePackage)) {
  console.error('E2E tests already removed.');
  process.exit(1);
}
fs.rmSync(e2ePackage, { recursive: true, force: true });

// Remove shared packages from the repo.
const sharedPackagesDir = 'packages/@amazeelabs';
if (!fs.existsSync(sharedPackagesDir)) {
  console.error('Shared packages already removed.');
  process.exit(1);
}
// But first, relink shared packages to NPM.
relinkSharedPackages(sharedPackagesDir);
fs.rmSync(sharedPackagesDir, { recursive: true, force: true });

// Remove the init script check.
replace('.github/workflows/test.yml', / {6}- name: Init check.*?\n\n/gs, '');

// Remove the init script.
const initPackage = 'packages/init';
if (!fs.existsSync(initPackage)) {
  console.error('Init script already removed.');
  process.exit(1);
}
fs.rmSync(initPackage, { recursive: true, force: true });

// Remove the init script check.
replace(
  '.github/workflows/test.yml',
  / {2}init_script:.*? {2}docker_build:/gs,
  '  docker_build:',
);

// Remove Release workflow.
const publishToNpmWorkflow = '.github/workflows/release.yml';
if (!fs.existsSync(publishToNpmWorkflow)) {
  console.error('Release workflow already removed.');
  process.exit(1);
}
fs.rmSync(publishToNpmWorkflow, { force: true });

// Remove Merge Release to Prod workflow.
const mergeReleaseWorkflow = '.github/workflows/merge_release_to_prod.yml';
if (!fs.existsSync(mergeReleaseWorkflow)) {
  console.error('Merge Release to Prod workflow already removed.');
  process.exit(1);
}
fs.rmSync(mergeReleaseWorkflow, { force: true });

console.log('👉 Run `pnpm i` to update the lock file.');
