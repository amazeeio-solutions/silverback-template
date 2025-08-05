<?php

namespace Drupal\search_api_global\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Entity\EntityMalformedException;
use Drupal\Core\Entity\Exception\UndefinedLinkTemplateException;
use Drupal\views\Views;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * Controller for Coffee module global search integration.
 */
class GlobalSearchCoffeeController extends ControllerBase {

  /**
   * Provides search results for Coffee module.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   The request object.
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   *   JSON response with search results.
   */
  public function search(Request $request) {
    $commands = [];
    $search = $request->query->get('search');
    // More advanced example to include view results.
    if ($view = Views::getView('global_search')) {
      $view->setDisplay('global_search_embed');
      if (!empty($search)) {
        $view->setExposedInput(['search_api_fulltext' => $search]);
      }
      $view->preExecute();
      $view->execute();

      foreach ($view->result as $row) {
        $entity = $row->_entity;
        $url = '';
        try {
          $url = $entity->toUrl()->toString();
        }
        catch (UndefinedLinkTemplateException | EntityMalformedException $e) {
          // Just do nothing here, in case we could not build a URL we will just
          // show an empty value there.
        }
        $commands[] = [
          'value' => $url,
          'label' => $entity->label() . ' (' . $entity->getEntityType()->getLabel() . ')<br/> <em style="font-size: 10px">' . $row->_item->getExcerpt() . '</em>',
        ];
      }
    }
    return new JsonResponse($commands);
  }

}
