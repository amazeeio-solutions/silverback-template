# Local Drupal modules

Put drupal.org modules you want to work on locally here, e.g. a git clone of a
contrib module. Everything except this README, `package.json` and `.gitignore`
is ignored by git.

The local Drupal setup (`prep:database` in `apps/cms`) symlinks this directory
to `apps/cms/web/sites/default/modules`. Drupal's extension discovery gives site
directory modules precedence over the composer-installed copies in
`web/modules/contrib`, so the local copy is loaded without composer changes.
Clear the cache (`pnpm drush cr` in `apps/cms`) after adding or removing one.

The symlink is not created on Lagoon or when `SKIP_DRUPAL_INSTALL` is set.
