<?php

namespace Drupal\remote_page\Entity;

use Drupal\Component\Utility\Crypt;
use Drupal\Core\Entity\ContentEntityBase;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeInterface;
use Drupal\Core\Field\BaseFieldDefinition;

/**
 * The remote page entity class.
 *
 * @ContentEntityType(
 *   id = "remote_page",
 *   label = @Translation("Remote page"),
 *   bundle_label = @Translation("Remote page"),
 *   base_table = "remote_page",
 *   translatable = FALSE,
 *   admin_permission = "administer site configuration",
 *   handlers = {
 *     "storage_schema" = "Drupal\remote_page\RemotePageStorageSchema",
 *   },
 *   entity_keys = {
 *     "id" = "rpid",
 *     "label" = "url",
 *     "bundle" = "host",
 *     "uuid" = "uuid",
 *   },
 *   links = {
 *     "canonical" = "/admin/config/remote_page/{remote_page}",
 *   }
 * )
 */
class RemotePage extends ContentEntityBase {

  public static function baseFieldDefinitions(EntityTypeInterface $entity_type) {
    $fields['rpid'] = BaseFieldDefinition::create('integer')
      ->setLabel(t('Remote page ID'))
      ->setDescription(t('The remote page ID.'))
      ->setReadOnly(TRUE);
    $fields['uuid'] = BaseFieldDefinition::create('uuid')
      ->setLabel(t('UUID'))
      ->setDescription(t('The record UUID.'))
      ->setReadOnly(TRUE);
    $fields['host'] = BaseFieldDefinition::create('string')
      ->setLabel(t('Host'))
      ->setDescription(t('The host of the remote page.'))
      ->setReadOnly(TRUE)
      ->setSetting('max_length', 255);
    $fields['url'] = BaseFieldDefinition::create('string')
      ->setLabel(t('URL'))
      ->setDescription(t('The url of the remote page.'))
      ->setReadOnly(TRUE)
      ->setSetting('max_length', 2048);
    $fields['lastmod'] = BaseFieldDefinition::create('string')
      ->setLabel(t('Last modified'))
      ->setDescription(t('The last modified date of the remote page.'))
      ->setReadOnly(TRUE)
      ->setSetting('max_length', 64);
    $fields['lastseenindex'] = BaseFieldDefinition::create('integer')
      ->setLabel(t('Last seen index'))
      ->setDescription(t('An index corresponding to the last time the remote page was seen in the source.'))
      ->setReadOnly(TRUE)
      ->setSetting('max_length', 255);
    $fields['hash'] = BaseFieldDefinition::create('string')
      ->setLabel(t('Hash'))
      ->setReadOnly(TRUE)
      ->setSetting('max_length', 64)
      ->setDescription(t('The remote page hash.'));
    return $fields;
  }

  /**
   * {@inheritdoc}
   */
  public function preSave(EntityStorageInterface $storage) {
    $this->set('hash', Crypt::hashBase64($this->url->value . '|' . $this->lastmod->value));
    parent::preSave($storage);
  }

  public static function bulkSync($remotePages, $lastSeenIndex) {
    $remoteHashedPages = [];
    foreach ($remotePages as $remotePage) {
      $hash = Crypt::hashBase64($remotePage['url'] . '|' . $remotePage['lastmod']);
      $remoteHashedPages[$hash] = $remotePage;
    }
    // When deciding which of the remote web pages have been updated, we do the
    // following: we query the database for the hashes that we computed above.
    // All the hashes which match the ones in the database will be fully skipped
    // from processing. For the ones that to do match, we load the entity from
    // the database, based on the url (if it exists) and we will just update the
    // lastmod date.
    // We do all this in chunks of 100, to avoid possible issues with too big
    // sql queries.
    $remotePageEntityTypeManager = \Drupal::entityTypeManager()->getStorage('remote_page');
    $baseTable = $remotePageEntityTypeManager->getBaseTable();
    foreach (array_chunk($remoteHashedPages, 100, TRUE) as $remoteHashedPagesChunck) {
      $existingHashes = \Drupal::database()->select($baseTable, 'base_table')
        ->fields('base_table', ['hash'])
        ->condition('hash', array_keys($remoteHashedPagesChunck), 'IN')
        ->execute()
        ->fetchAllKeyed(0, 0);
      if (!empty($existingHashes)) {
        // For all existing hashes we want to immediately update the last seen
        // index value, with a direct query.
        \Drupal::database()->update($baseTable)
        ->fields(['lastseenindex' => $lastSeenIndex])
        ->condition('hash', array_keys($existingHashes), 'IN')
        ->execute();
      }

      $remoteHashedPagesChunck = array_diff_key($remoteHashedPagesChunck, $existingHashes);
      foreach ($remoteHashedPagesChunck as $hash => $remoteHashedPage) {
        // Load the entity based on the url. If it does not exist yet, we create
        // a new one.
        $item = $remotePageEntityTypeManager->loadByProperties(['url' => $remoteHashedPage['url']]);
        if ($item) {
          $item = reset($item);
        } else {
          $host = parse_url($remoteHashedPage['url'], PHP_URL_HOST);
          $host = str_replace('.', '_', $host);
          $item = $remotePageEntityTypeManager->create([
            'url' => $remoteHashedPage['url'],
            'host' => $host,
          ]);
        }
        $item->set('lastmod', $remoteHashedPage['lastmod']);
        $item->set('lastseenindex', $lastSeenIndex);
        $item->save();
      }
    }
  }

}
