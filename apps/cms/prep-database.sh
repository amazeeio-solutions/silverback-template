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
pnpm drush cr
