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
 *     "id" = "wpid",
 *     "label" = "url",
 *     "bundle" = "host",
 *     "uuid" = "uuid",
 *   },
 *   links = {
 *     "canonical" = "/admin/config/search/external_page/{external_web_page}",
 *   }
 * )
 */
class ExternalWebPage extends ContentEntityBase {

  public static function baseFieldDefinitions(EntityTypeInterface $entity_type) {
    $fields['wpid'] = BaseFieldDefinition::create('integer')
      ->setLabel(t('Webpage ID'))
      ->setDescription(t('The web page ID.'))
      ->setReadOnly(TRUE);
    $fields['uuid'] = BaseFieldDefinition::create('uuid')
      ->setLabel(t('UUID'))
      ->setDescription(t('The record UUID.'))
      ->setReadOnly(TRUE);
    $fields['host'] = BaseFieldDefinition::create('string')
      ->setLabel(t('Host'))
      ->setDescription(t('The host of the external web page.'))
      ->setReadOnly(TRUE)
      ->setSetting('max_length', 255);
    $fields['url'] = BaseFieldDefinition::create('string')
      ->setLabel(t('URL'))
      ->setDescription(t('The url of the external web page.'))
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
      $itemUrl = (string) $url->loc;
      $lastmod = (string) $url->lastmod;
      $item = $webPageEntityTypeManager->loadByProperties(['url' => $itemUrl]);
      if ($item) {
        $item = reset($item);
        $lastmod = $item->get('lastmod')->value;
        if ($lastmod !== $url->lastmod) {
          $item->set('lastmod', $url->lastmod);
          $item->save();
        }
      } else {
        $host = parse_url($itemUrl, PHP_URL_HOST);
        $item = $webPageEntityTypeManager->create([
          'url' => $itemUrl,
          'lastmod' => $lastmod,
          'host' => str_replace('.', '_', $host),
        ]);
        $item->save();
      }
    }
  }
}
