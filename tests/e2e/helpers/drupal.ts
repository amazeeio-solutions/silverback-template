import { execSync } from 'child_process';

export const drush = (cmd: string): string => {
  return execSync(
    `pnpm --filter "@custom/cms" exec -- pnpm --silent drush ${cmd}`,
  ).toString();
};

export const silverback = (cmd: string): string => {
  return execSync(
    `pnpm --filter "@custom/cms" exec -- pnpm --silent silverback ${cmd}`,
  ).toString();
};

export const resetDrupal = () => {
  silverback('-y snapshot-restore tests-initial');
};
