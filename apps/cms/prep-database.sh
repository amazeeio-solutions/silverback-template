set -e
if ! test -f web/sites/default/files/.sqlite; then
  pnpm drupal-install
else
  pnpm drush deploy -y
fi
