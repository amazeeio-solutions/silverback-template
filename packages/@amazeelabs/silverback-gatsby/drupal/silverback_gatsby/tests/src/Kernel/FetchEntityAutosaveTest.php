<?php

namespace Drupal\Tests\silverback_gatsby\Kernel;

use Drupal\field\Entity\FieldConfig;
use Drupal\field\Entity\FieldStorageConfig;
use Drupal\node\Entity\Node;

class FetchEntityAutosaveTest extends EntityFeedTestBase {

  protected function setUp(): void {
    parent::setUp();
    // Enable after parent::setUp() to avoid hook errors during user creation.
    $this->enableModules(['silverback_autosave']);
    $this->installSchema('silverback_autosave', ['silverback_autosave_entity_form']);

    FieldStorageConfig::create([
      'field_name' => 'field_reference',
      'entity_type' => 'node',
      'type' => 'entity_reference',
      'settings' => [
        'target_type' => 'node',
      ],
    ])->save();

    FieldConfig::create([
      'field_name' => 'field_reference',
      'entity_type' => 'node',
      'bundle' => 'page',
      'label' => 'Reference',
    ])->save();
  }

  public function testAutosaveSkipsEntityReferenceFields(): void {
    $referencedNode = Node::create([
      'type' => 'blog',
      'title' => 'Referenced Node',
      'status' => 1,
    ]);
    $referencedNode->save();

    $node = Node::create([
      'type' => 'page',
      'title' => 'Original Title',
      'body' => [['value' => 'Original body']],
      'field_reference' => [['target_id' => $referencedNode->id()]],
      'status' => 1,
    ]);
    $node->save();

    $this->storeAutosave($node, [
      'title' => [['value' => 'Autosaved Title']],
      'body' => [['value' => 'Autosaved body']],
      'field_reference' => [['target_id' => "Referenced Node ({$referencedNode->id()})"]],
    ]);

    $result = $this->executeDataProducer('fetch_entity', [
      'type' => 'node',
      'id' => (string) $node->id(),
      'bundles' => ['page'],
      'access' => FALSE,
    ]);

    $this->assertNotNull($result);
    $this->assertEquals('Autosaved Title', $result->getTitle());
    $this->assertEquals('Autosaved body', $result->get('body')->value);
    $this->assertEquals(
      $referencedNode->id(),
      $result->get('field_reference')->target_id,
      'Entity reference field should retain its original target_id, not be corrupted by autocomplete string input.',
    );
  }

  private function storeAutosave(Node $node, array $userInput): void {
    $serializer = \Drupal::service('serialization.phpserialize');
    $currentUserId = \Drupal::currentUser()->id();
    \Drupal::database()->insert('silverback_autosave_entity_form')
      ->fields([
        'form_id' => "node_{$node->bundle()}_edit_form",
        'form_session_id' => 'test-session',
        'entity_type_id' => 'node',
        'entity_id' => $node->id(),
        'langcode' => $node->language()->getId(),
        'uid' => $currentUserId,
        'timestamp' => time(),
        'entity' => $serializer->encode(Node::load($node->id())),
        'form_state' => $serializer->encode([
          'storage' => [],
          'input' => $userInput,
        ]),
      ])
      ->execute();
  }

}
