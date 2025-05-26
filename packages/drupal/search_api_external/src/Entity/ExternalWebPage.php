<?php

namespace Drupal\search_api_external\Entity;

use Drupal\Core\Entity\ContentEntityBase;
use Drupal\Core\Entity\EntityTypeInterface;
use Drupal\Core\Field\BaseFieldDefinition;

/**
 * The external web page entity class.
 *
 * @ContentEntityType(
 *   id = "external_web_page",
 *   label = @Translation("External web page"),
 *   bundle_label = @Translation("External web page"),
 *   base_table = "external_web_page",
 *   translatable = FALSE,
 *   admin_permission = "administer site configuration",
 *   entity_keys = {
 *     "id" = "id",
 *     "label" = "id",
 *   }
 * )
 */
class ExternalWebPage extends ContentEntityBase {

  public static function baseFieldDefinitions(EntityTypeInterface $entity_type) {
    $fields['id'] = BaseFieldDefinition::create('string')
      ->setLabel(t('ID'))
      ->setDescription(t('The ID (url) of the external web page.'))
      ->setReadOnly(TRUE)
      ->setSetting('max_length', 2048);

    $fields['lastmod'] = BaseFieldDefinition::create('string')
      ->setLabel(t('Last modified'))
      ->setDescription(t('The last modified date of the external web page.'))
      ->setReadOnly(TRUE)
      ->setSetting('max_length', 64);
    return $fields;
  }

  public static function syncFromXmlSitemap($xmlsitemapUrl) {
    $xmlContent = file_get_contents($xmlsitemapUrl);
    $xml = simplexml_load_string($xmlContent);
    $webPageEntityTypeManager = \Drupal::entityTypeManager()->getStorage('external_web_page');
    foreach ($xml->url as $url) {
      $itemId = (string) $url->loc;
      $lastmod = (string) $url->lastmod;
      $item = $webPageEntityTypeManager->load($itemId);
      if ($item) {
        $lastmod = $item->get('lastmod')->value;
        if ($lastmod !== $url->lastmod) {
          $item->set('lastmod', $url->lastmod);
          $item->save();
        }
      } else {
        $item = $webPageEntityTypeManager->create([
          'id' => $itemId,
          'lastmod' => $lastmod,
        ]);
        $item->save();
      }
    }
  }
}
