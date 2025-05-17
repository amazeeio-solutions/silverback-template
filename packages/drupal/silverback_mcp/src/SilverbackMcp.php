<?php

declare(strict_types=1);

namespace Drupal\silverback_mcp;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\Session\AccountProxyInterface;
use fivefilters\Readability\Readability;
use fivefilters\Readability\Configuration;
use fivefilters\Readability\ParseException;
use Drupal\node\Entity\Node;

/**
 * @todo Add class description.
 */
final class SilverbackMcp {

  /**
   * Constructs a SilverbackMcp object.
   */
  public function __construct(
    private readonly EntityTypeManagerInterface $entityTypeManager,
    private readonly RouteMatchInterface $routeMatch,
    private readonly AccountProxyInterface $currentUser,
    private readonly LoggerChannelFactoryInterface $loggerFactory,
    private readonly ConfigFactoryInterface $configFactory,
  ) {
  }

  /**
   * @todo Add method description.
   */
  public function createNode(string $title, string $body) {
    // @todo
    $node = Node::create([
      'title' => 'Some title',
    ]);
    return [
      'title' => $node->label(),
    ];
  }

  /**
   * @todo Add method description.
   */
  public function fetchRemotePageContent(string $url) {
    $readability = new Readability(new Configuration());
    $html = file_get_contents($url);
    try {
      $readability->parse($html);
      return [
        'title' => $readability->getTitle(),
        'content' => $readability->getContent(),
      ];
    } catch (ParseException $e) {
      $this->loggerFactory->get('silverback_mcp')->error($e->getMessage());
    }
  }
}
