<?php

namespace Drupal\remote_page\Controller;

use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\Controller\EntityViewController;

class RemotePageViewController extends EntityViewController {

  public function view(EntityInterface $remote_page, $view_mode = 'full') {
    return parent::view($remote_page, $view_mode);
  }
}
