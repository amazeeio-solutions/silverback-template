<?php
use AmazeeLabs\DefaultContent\Import;
use Drupal\Component\Serialization\Yaml;
use Drupal\locale\StringStorageInterface;
use Drupal\webform\Entity\Webform;

if (PHP_SAPI !== 'cli') {
  die;
}

Import::run('test_content');

// Import webforms.
foreach (glob(__DIR__ . '/webforms/*.yml') as $file) {
  Webform::create(Yaml::decode(file_get_contents($file)))->save();
}

// Create an example string translation for test cases.
$stringStorage = \Drupal::service('locale.storage');
if ($stringStorage instanceof StringStorageInterface) {
  /** @var \Drupal\locale\StringInterface $strings */
  $strings = $stringStorage->getStrings([
    'source' => 'Company Name',
    'context' => 'website',
  ]);
  $lid = 0;
  if (empty($strings)) {
    $lid = $stringStorage->createString([
      'source' => 'Company name',
      'context' => 'website',
    ])->save()->lid;
  }
  else {
    $lid = $strings[0]->lid;
  }
  $stringStorage->createTranslation([
    'lid' => $lid,
    'language' => 'de',
    'translation' => 'Drupal Company',
  ])->save();
}
