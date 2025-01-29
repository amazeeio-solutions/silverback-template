<?php

namespace Drupal\custom;

use Drupal\Core\Database\Connection;
use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\graphql_directives\DirectiveArguments;
use Drupal\locale\SourceString;
use Drupal\locale\StringStorageInterface;

/**
 * Service to retrieve all translatable strings.
 */
class Translatables {

  public function __construct(
    protected LanguageManagerInterface $languageManager,
    protected StringStorageInterface $localeStorage,
    protected Connection $connection,
  ) {
  }

  /**
   * Retrieve all translatable strings.
   *
   * @return array{source: string, language: string, translation: string}[]
   *   List of translatable strings.
   */
  public function all(DirectiveArguments $args): mixed {
    $args->context->addCacheTags(['locale']);
    $languages = $this->languageManager->getLanguages();
    $query = $this->connection->select('locales_source', 's')
      ->fields('s');
    if (!empty($args->args['context'])) {
      $query->condition('s.context', $this->connection->escapeLike($args->args['context']) . '%', 'LIKE');
    }
    $result = $query->execute()->fetchAll();

    /** @var array{source: $string string, language: string, translation: string}[] */
    $strings = [];
    foreach ($result as $item) {
      $sourceString = new SourceString($item);
      foreach ($languages as $language) {
        $translations = $this->localeStorage->getTranslations([
          'lid' => $sourceString->getId(),
          'language' => $language->getId(),
        ]);
        if (!empty($translations)) {
          $translatedString = reset($translations);
          if ($translatedString->isTranslation()) {
            $strings[] = [
              'source' => $sourceString->getString(),
              'language' => $language->getId(),
              'translation' => $translatedString->getString(),
            ];
          }
        }
      }
    }
    return $strings;
  }

}
