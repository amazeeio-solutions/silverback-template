# Search API Remote page

Integrates the `Remote page` entities with the `Search API` module.

## Installation

- `composer require amazeelabs/search_api_remote_page`
- `drush en search_api_remote_page`

## Overview

This modules alters the configuration of the `Remote page` entities datasource so that the user can configure a set of XML Sitemaps from where `Remote page` entities can be created.

To do that, there is a drush command available: `search_api_remote_page:track-xmlsitemaps` ( alias  `sapi-txml`) which uses the `search_api_remote_page.sapi_remote_page_sync` service, provided by this module as well, to check for updates of `Remote pages` configured in search indexes. It is important to mentioned that this command will actually create a queue worker of type `remote_page_xmlsitemap_sync` for every xmlsitemap url. The actuall sync will happen only when that queue worked will get executed at a later stage. This command would be triggered typically by a cron job.

To immediately create the `Remote page` entities, you could use this combination of drush commands: `drush sapi-txml && drush queue:run remote_page_xmlsitemap_sync`.
