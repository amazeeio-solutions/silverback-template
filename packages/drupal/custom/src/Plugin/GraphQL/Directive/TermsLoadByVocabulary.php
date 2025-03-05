<?php

namespace Drupal\custom\Plugin\GraphQL\Directive;

use Drupal\Core\Plugin\PluginBase;
use Drupal\graphql\GraphQL\Resolver\ResolverInterface;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql_directives\DirectiveInterface;
use Drupal\graphql_directives\Plugin\GraphQL\Directive\ArgumentTrait;
use Drupal\taxonomy\Entity\Term;

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
    return $builder->callback(function ($parent, $args) use ($arguments) {
      if (!isset($arguments['bundle'])) {
        throw new \Exception('A bundle must be provided.');
      }

      $items = [];
      $bundle = $arguments['bundle'];

      $storage = \Drupal::entityTypeManager()->getStorage('taxonomy_term');
      $terms = $storage->loadByProperties(['vid' => $bundle]);
      if ($terms) {
        foreach ($terms as $key => $term) {
          $items[$key] = $term;
        }
      }

      return $items ?: NULL;
    });
  }
}
