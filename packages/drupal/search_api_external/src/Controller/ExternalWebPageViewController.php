<?php

namespace Drupal\search_api_external\Controller;

use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\Controller\EntityViewController;

class ExternalWebPageViewController extends EntityViewController {

  public function view(EntityInterface $external_web_page, $view_mode = 'full') {
    return parent::view($external_web_page, $view_mode);
  }
}
