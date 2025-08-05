<?php

namespace Drupal\custom\Plugin\views\field;

use Drupal\Core\Url;
use Drupal\node\Plugin\views\field\Node;
use Drupal\views\ResultRow;

/**
 * Field handler to provide a simple renderer that allows linking to a node revision.
 *
 *  Can be used to provide the same EX as the core 'content' view
 *  when it's replaced by the 'moderated_content' view for the same purpose:
 *  - Use the latest revision route if the node has a pending revision
 *  - Otherwise, use the canonical node route.
 *
 * @ingroup views_field_handlers
 *
 * @ViewsField("custom_node_revision_title")
 */
class NodeRevisionTitle extends Node {

  /**
   * {@inheritdoc}
   */
  protected function renderLink($data, ResultRow $values) {
    if (!empty($this->options['link_to_node']) && !empty($this->additional_fields['nid'])) {
      if ($data !== NULL && $data !== '') {
        $this->options['alter']['make_link'] = TRUE;

        $node = $this->getEntity($values);
        if (isset($values->node_field_revision_langcode)) {
          $langcode = $values->node_field_revision_langcode;
          if ($node->hasTranslation($langcode)) {
            $node = $node->getTranslation($langcode);
          }
          $this->options['alter']['language'] = $node->language();
        }
        else {
          unset($this->options['alter']['language']);
        }

        $moderationInfo = \Drupal::service('content_moderation.moderation_information');
        $url = $moderationInfo->hasPendingRevision($node) ?
          Url::fromRoute('entity.node.latest_version',
            ['node' => $node->id()],
            ['language' => $node->language()]
          ) :
          $node->toUrl();
        $this->options['alter']['url'] = $url;
      }
      else {
        $this->options['alter']['make_link'] = FALSE;
      }
    }
    return $data;
  }

}
