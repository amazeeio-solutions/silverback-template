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

}
