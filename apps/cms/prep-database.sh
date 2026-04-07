if [ ! -z $LAGOON ]; then
  # Do not touch database on Lagoon
  exit 0
fi

if [ ! -z $SKIP_DRUPAL_INSTALL ]; then
  exit 0
fi

set -e

# Ensure symlink to drupal-local modules exists
if [ ! -L web/sites/default/modules ]; then
  ln -sf ../../../../../packages/drupal-local web/sites/default/modules
fi

if ! test -f web/sites/default/files/.sqlite; then
  pnpm drupal-install
  pnpm export-webforms
fi

# In any case, re-import translation string.
pnpm import-translations

pnpm drush php-eval 'require_once DRUPAL_ROOT . "/modules/custom/custom/custom.deploy.php"; custom_deploy_create_default_preview_user();'

pnpm drush cr

# Used in e2e tests.
pnpm silverback -y snapshot-create initial
