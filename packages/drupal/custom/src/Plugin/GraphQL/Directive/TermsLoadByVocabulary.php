<?php

namespace Drupal\custom\Plugin\GraphQL\Directive;

use Drupal\Core\Plugin\PluginBase;
use Drupal\graphql\GraphQL\Resolver\ResolverInterface;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql_directives\DirectiveInterface;
use Drupal\graphql_directives\Plugin\GraphQL\Directive\ArgumentTrait;
use Drupal\Core\Cache\RefinableCacheableDependencyInterface;
use Drupal\Core\Cache\CacheableMetadata;

/**
 * @Directive(
 *   id = "loadByVocabulary",
 *   description = "Loads all terms of a given vocabulary",
 *   arguments = {
 *     "bundle" = "String",
 *   }
 * )
 */
class TermsLoadByVocabulary extends PluginBase implements DirectiveInterface {

  use ArgumentTrait;

  /**
   * {@inheritDoc}
   * @throws \Exception
   */
  public function buildResolver(ResolverBuilder $builder, array $arguments): ResolverInterface {
    return $builder->callback(function ($parent, $args, $context, $info, RefinableCacheableDependencyInterface $metadata) use ($arguments) {
      if (!isset($arguments['bundle'])) {
        throw new \Exception('A bundle must be provided.');
      }

      $items = [];
      $bundle = $arguments['bundle'];

      // Create cache metadata for this query
      $cache = new CacheableMetadata();
      $cache->addCacheTags(['taxonomy_term_list', 'taxonomy_term_list:' . $bundle]);

      $storage = \Drupal::entityTypeManager()->getStorage('taxonomy_term');
      $terms = $storage->loadByProperties(['vid' => $bundle]);
      if ($terms) {
        foreach ($terms as $key => $term) {
          $items[$key] = $term;
          // Add each term's cache tags
          $cache->addCacheableDependency('taxonomy_term:'.$term->id());
        }
      }

      // Add the cache metadata to the result
      $metadata->addCacheableDependency($cache);

      return $items ?: NULL;
    });
  }
}