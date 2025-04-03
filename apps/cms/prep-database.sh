if [ ! -z $LAGOON ]; then
  # Do not touch database on Lagoon
  exit 0
fi

if [ ! -z $SKIP_DRUPAL_INSTALL ]; then
  exit 0
fi

set -e

pnpm drupal-install

# In any case, re-import translation string.
pnpm import-translations
pnpm drush cr
