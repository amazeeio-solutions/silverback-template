# Remote page

Provides a `Remote page` entity type which is basically a reference to an external web page.

The entities are based on the information from an xmlsitemap file, so they have fields for storing the `url`, `lastmod` and `changefreq` values.

## Installation
- `composer require amazeelabs/remote_page`
- `drush en remote_page`

## Overview

The module itself provides support for creating these entities. The following services are available:
- `remote_page.xmlsitemap_source`: this can be used to get a list of entries from a xmlsitemap url, sent as a parameter, by using the `getXmlSitemapEntries` method.
- `remote_page.sync`: this can be used to sync a set of xmlsitemap entries. New ones will be added, existing ones could be updated.
- `remote_page.cleanup`: this can be used to either queue a cleanup job or just directly cleanup (delete) a set of entities. The current cleanup process makes use of a so called `lastseenindex` which is basically just a number that is attached to every `Remote page` entity and is used to flag that a specific entity has been _seen_ in the source of items. It is the job of the code that invokes the sync call to provide this value. For an implementation, you can check the `search_api_remote_page` module, the `SapiRemotePageSync::checkForUpdates()` method. During the cleanup process, this module will look for _older_ values of the `lastseenindex` field and will enqueue those entities for cleanup.

## Queue workers

While the sync and the cleanup processes can be triggered directly, using the services described above, they can take a long time to complete (depending on the amount of data to be processed). Because of this, it is advisable to run them via queue workers, in the background. This module provides 2 queue workers:
- `remote_page_xmlsitemap_sync`: a queue worker that has to be created for a specific xmlsitemap url and a `lastseenindex` value (see above). This will run the `bulkSync` method of the `remote_page.sync` service. For an concrete use of this, you can check the `search_api_remote_page` module, the `SapiRemotePageSync::checkForUpdates()` method.
- `remote_page_cleanup`: a queue worked that is created for a set of `Remote page` entity ids. This will just trigger the `cleanup` method of the `remote_page.cleanup` service. For a concrete use of this queue worked, see the `Cleanup::queueCleanup()` method of this service, which implements a cleanup procedure based on the above mentioned `lastseenindex`.

## Drush commands

For the cleanup process, there is also a drush command available: `remote_page:cleanup` (alias `rpc`). This is typically a command that can be run at cron time, once a day for example. This command would just enqueue entities for cleanup (se the `Queue workers` section above). To enqueue the cleanup and run it at the same time you can use this: `drush rpc && drush queue:run remote_page_cleanup`.
