<?php

namespace Drupal\custom;

use Drupal\Core\Cache\CacheableMetadata;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql\GraphQL\Resolver\ResolverInterface;
use Drupal\graphql_directives\Api;

/**
 * Custom directives.
 */
class Directives {

  /**
   * Loads a given entity by its uuid.
   */
  public static function loadByUuid(ResolverBuilder $builder) : ResolverInterface {
    $type = $builder->fromArgument('type');
    $uuid = $builder->fromArgument('uuid');
    $operation = $builder->fromArgument('operation') ?? $builder->fromValue('view');

    // All other cases require a "type" argument.
    if (!$type) {
      throw new \Exception('A type must be provided.');
    }
    if (!$uuid) {
      throw new \Exception('A uuid must be provided.');
    }

    return $builder->produce('entity_load_by_uuid')
      ->map('type', $type)
      ->map('access_operation', $operation)
      ->map('language', $builder->fromContext('document_language'))
      ->map('uuid', $uuid);
  }

  /**
   * Resolves the parent value.
   */
  public static function parentValue(ResolverBuilder $builder) : ResolverInterface {
    return $builder->fromParent();
  }

  /**
   * Retrieve the entity edit link.
   */
  public static function entityEditLink(ResolverBuilder $builder) : ResolverInterface {
    return $builder->compose(
      $builder->produce('entity_url')
        ->map('entity', $builder->fromParent())
        ->map('rel', $builder->fromValue('edit-form')),
      $builder->produce('url_path')->map('url', $builder->fromParent()),
      $builder->callback(function ($path) {
        // Can't use "absolute" option when building the URL, because Gatsby
        // tricks Drupal to think its base URL is Netlify URL.
        return (getenv('LAGOON_ROUTE') ?: 'http://127.0.0.1:8888') . $path;
      })
    );
  }

  /**
   * Loads terms by vocabulary.
   */
  public static function loadByVocabulary(Api $api) : array | null {
    if (!isset($api->args['bundle'])) {
      throw new \Exception('A bundle must be provided.');
    }

    $items = [];
    $bundle = $api->args['bundle'];

    // Create cache metadata for this query.
    $cache = new CacheableMetadata();
    $cache->addCacheTags(['taxonomy_term_list', 'taxonomy_term_list:' . $bundle]);

    $storage = \Drupal::entityTypeManager()->getStorage('taxonomy_term');
    $terms = $storage->loadByProperties(['vid' => $bundle]);
    if ($terms) {
      foreach ($terms as $key => $term) {
        $items[$key] = $term;
        // Add each term's cache tags.
        $cache->addCacheableDependency('taxonomy_term:' . $term->id());
      }
    }

    // Add the cache metadata to the result.
    $api->context->addCacheableDependency($cache);

    return $items ?: NULL;
  }

  /**
   * Resolves the translated strings.
   */
  public static function translatedStrings(Api $api) : array | null {
    /** @var \Drupal\locale\StringDatabaseStorage  $stringStorage */
    $stringStorage = \Drupal::service('locale.storage');
    // We are only interested in the translated strings that belong to the
    // website context.
    $translations = $stringStorage->getTranslations(['context' => 'website', 'translated' => TRUE]);
    return array_map(function ($item) {
      return [
        '__typename' => 'DrupalTranslatableString',
        'source' => $item->source,
        'language' => $item->language,
        'translation' => $item->translation,
      ];
    }, $translations);
  }

  /**
   * Resolves the home route for a path argument (if the path argument matches
   * the frontend url, like '/' for example).
   */
  public static function homeRoute(Api $api) : string {
    $path = $api->args['path'];
    $pathValidator = \Drupal::pathValidator();
    // The idea is to check if the path url route matches the frontend url
    // route. For that, we need first to construct a URL object for both.
    $url = $pathValidator->getUrlIfValidWithoutAccessCheck($path);
    $frontendUrl = $pathValidator->getUrlIfValidWithoutAccessCheck('/');
    try {
      // If we could not get a valid URL out of the path (or if the url is not
      // routed), then we just return the original path.
      if (!$url || !$url->isRouted()) {
        return $path;
      }
      if ($url->getInternalPath() === $frontendUrl->getInternalPath()) {
        $websiteSettings = \Drupal::entityTypeManager()->getStorage('config_pages')
          ->loadByProperties(['type' => 'website_settings']);
        if (empty($websiteSettings)) {
          // No website settings found, just return the original path.
          return $path;
        }

        // The website settings entities are currently not translated (they do
        // not have the language context set). In case we will set this, then we
        // will have to adapt this code so that it loads the proper translation.
        // However, for our case here, it does not matter, because we only have
        // to load a node reference (the home page), which should be the same
        // for all languages (usually).
        $websiteSettings = reset($websiteSettings);
        if (!$websiteSettings->hasField('field_home_page') || $websiteSettings->get('field_home_page')->isEmpty()) {
          // No home page node reference found, just return the original path.
          return $path;
        }

        $homePage = $websiteSettings->get('field_home_page')->referencedEntities()[0]->toUrl()->getInternalPath();
        // If we found a home page, then we have to construct the path in a way
        // that it will keep the language prefix (or any other frontend prefixes
        // that might be set). For the home page, we have a special case: the
        // home page can be accessed either by the path "/", or by the path
        // "/en" or "/de" (so the language prefix). In any of the cases, we can
        // just keep the original path as the path prefix and use the internal
        // path for the home page (the internal path of a url does not contain
        // the path prefix).
        // Examples (assuming the homepage internal path is 'node/1'):
        // - if the path is '/', the result will be '/node/1'
        // - if the path is '/en' (or '/en/'), the result will be '/en/node/1'
        // - if the path is '/de' (or '/de/'), the result will be '/de/node/1'
        // In all the cases, if a url prefix is set, it will be kept for the
        // resulting path.
        return implode('/', [
          '',
          trim($path, '/'),
          trim($homePage, '/'),
        ]);
      }
    }
    catch (\Exception $e) {
      // Just return the original path in case we get any exception.
      return $path;
    }
    // If we get here, then the path did not match the frontend URL, so we just
    // return it as it is.
    return $path;
  }

}
