<?php

namespace Drupal\custom\Plugin\GraphQL\Directive;

use Drupal\Core\Plugin\PluginBase;
use Drupal\graphql\GraphQL\Resolver\ResolverInterface;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql_directives\DirectiveInterface;

/**
 * @Directive(
 *   id = "drupalTranslatedStrings"
 * )
 */
class DrupalTranslatedStrings extends PluginBase implements DirectiveInterface {

  public function buildResolver(ResolverBuilder $builder, array $arguments): ResolverInterface {
    /* @var \Drupal\locale\StringDatabaseStorage  $stringStorage */
    $stringStorage = \Drupal::service('locale.storage');
    // We are only interested in the translated strings that belong to the
    // website context.
    $translations = $stringStorage->getTranslations(['context' => 'website', 'translated' => TRUE]);
    return $builder->fromValue(array_map(function($item) {
      return [
        '__typename' => 'DrupalTranslatableString',
        'source' => $item->source,
        'language' => $item->language,
        'translation' => $item->translation,
      ];
    }, $translations));
  }

}
