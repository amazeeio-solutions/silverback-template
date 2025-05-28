<?php

namespace Drupal\search_api_external\Entity;

use Drupal\Component\Utility\Crypt;
use Drupal\Core\Entity\ContentEntityBase;
use Drupal\Core\Entity\EntityStorageInterface;
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
 *   handlers = {
 *     "storage_schema" = "Drupal\search_api_external\ExternalWebPageStorageSchema",
 *   },
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
    $fields['hash'] = BaseFieldDefinition::create('string')
      ->setLabel(t('Hash'))
      ->setReadOnly(TRUE)
      ->setSetting('max_length', 64)
      ->setDescription(t('The web page hash.'));
    return $fields;
  }

  /**
   * {@inheritdoc}
   */
  public function preSave(EntityStorageInterface $storage) {
    $this->set('hash', Crypt::hashBase64($this->url->value . '|' . $this->lastmod->value));
    parent::preSave($storage);
  }

  public static function syncFromXmlSitemap($xmlsitemapUrl) {
    $xmlContent = file_get_contents($xmlsitemapUrl);
    $xml = simplexml_load_string($xmlContent);
    $webPageEntityTypeManager = \Drupal::entityTypeManager()->getStorage('external_web_page');
    $host = parse_url($xmlsitemapUrl, PHP_URL_HOST);
    $host = str_replace('.', '_', $host);
    $urls = [];
    foreach ($xml->url as $url) {
      $hash = Crypt::hashBase64((string) $url->loc . '|' . (string) $url->lastmod);
      $urls[$hash] = [
        'url' => (string) $url->loc,
        'lastmod' => (string) $url->lastmod,
      ];
    }
    // We do not need the $xml object anymore, so we unset it to free up memory.
    unset($xml);

    // When deciding which of the external web pages have been updated, we do
    // the following: we query the database for the hashes that we computed
    // above, when reading the xml sitemap entries. All the hashes which match
    // the ones in the database will be fully skipped from processing. For the
    // ones that to do match, we load the entity from the database, based on
    // the url (if it exists) and we will just update the lastmod date.
    // We do all this in chunks of 100, to avoid possible issues with too big
    // sql queries.
    $baseTable = $webPageEntityTypeManager->getBaseTable();
    foreach (array_chunk($urls, 100, TRUE) as $urlsChunk) {
      $existingHashes = \Drupal::database()->select($baseTable, 'base_table')
        ->fields('base_table', ['hash'])
        ->condition('hash', array_keys($urlsChunk), 'IN')
        ->execute()
        ->fetchAllKeyed(0, 0);
      $urlsChunk = array_diff_key($urlsChunk, $existingHashes);
      foreach ($urlsChunk as $hash => $url) {
        // Load the entity based on the url. If it does not exist yet, we create
        // a new one.
        $item = $webPageEntityTypeManager->loadByProperties(['url' => $url['url']]);
        if ($item) {
          $item = reset($item);
        } else {
          $item = $webPageEntityTypeManager->create([
            'url' => $url['url'],
            'host' => $host,
          ]);
        }
        $item->set('lastmod', $url['lastmod']);
        $item->save();
      }
    }
  }
}
