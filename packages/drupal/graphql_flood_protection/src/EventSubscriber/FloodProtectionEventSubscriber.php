<?php

namespace Drupal\graphql_flood_protection\EventSubscriber;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Flood\FloodInterface;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\graphql\Event\OperationEvent;
use Drupal\graphql_flood_protection\Exception\RateLimitExceededException;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\RequestStack;

/**
 * Event subscriber for GraphQL flood protection.
 */
class FloodProtectionEventSubscriber implements EventSubscriberInterface {

  /**
   * Constructs a new FloodProtectionEventSubscriber.
   *
   * @param \Drupal\Core\Flood\FloodInterface $flood
   *   The flood service.
   * @param \Symfony\Component\HttpFoundation\RequestStack $requestStack
   *   The request stack.
   * @param \Drupal\Core\Config\ConfigFactoryInterface $configFactory
   *   The config factory.
   * @param \Drupal\Core\Logger\LoggerChannelFactoryInterface $loggerFactory
   *   The logger factory.
   */
  public function __construct(
    private readonly FloodInterface $flood,
    private readonly RequestStack $requestStack,
    private readonly ConfigFactoryInterface $configFactory,
    private readonly LoggerChannelFactoryInterface $loggerFactory
  ) {}

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('flood'),
      $container->get('request_stack'),
      $container->get('config.factory'),
      $container->get('logger.factory')
    );
  }

  /**
   * {@inheritdoc}
   */
  public static function getSubscribedEvents() {
    return [
      OperationEvent::GRAPHQL_OPERATION_BEFORE => 'onBeforeOperation',
    ];
  }

  /**
   * Handles GraphQL operations before execution.
   *
   * @param \Drupal\graphql\Event\OperationEvent $event
   *   The operation event.
   */
  public function onBeforeOperation(OperationEvent $event) {
    $context = $event->getContext();
    $operation = $context->getOperation();
    $query = $operation->query;

    // Only apply flood protection to mutations.
    if (!preg_match('/^\s*mutation\s+/i', $query)) {
      return;
    }

    $request = $this->requestStack->getCurrentRequest();
    if (!$request) {
      return;
    }

    // Get client IP with CDN support and fallback chain.
    // Priority order: Cloudflare -> Fastly -> Generic CDN -> Standard proxy.
    $client_ip = $request->headers->get('CF-Connecting-IP') ?:      // Cloudflare
                 $request->headers->get('True-Client-IP') ?:         // Cloudflare Enterprise
                 $request->headers->get('Fastly-Client-IP') ?:       // Fastly
                 $request->headers->get('X-Real-IP') ?:              // Netlify and other CDN/proxies
                 $this->getFirstForwardedFor($request) ?:            // X-Forwarded-For (first IP only)
                 $request->getClientIp();                            // Fallback

    if (!$client_ip) {
      return;
    }

    // Extract mutation name from the query.
    $mutation_name = $this->extractMutationName($query);

    // Get configuration settings.
    $config = $this->configFactory->get('graphql_flood_protection.settings');

    // Check if this mutation is excluded from protection.
    $excluded_mutations = $config->get('excluded_mutations') ?: [];
    if (in_array($mutation_name, $excluded_mutations, TRUE)) {
      // Skip flood protection for excluded mutations.
      return;
    }

    // Get rate limit settings with conservative fallbacks.
    $ip_limit = $config->get('ip_limit') ?: 6;  // Conservative fallback: 6 requests
    $ip_window = $config->get('ip_window') ?: 3600;  // 1 hour window

    // Ensure we have valid values even if config is corrupted.
    $ip_limit = max(1, min(1000, (int) $ip_limit));
    $ip_window = max(60, min(86400, (int) $ip_window));

    // Create per-mutation flood key for granular rate limiting.
    $flood_key = 'graphql_mutation:' . $mutation_name . ':' . $client_ip;

    if (!$this->flood->isAllowed($flood_key, $ip_limit, $ip_window)) {
      $this->loggerFactory->get('graphql_flood_protection')->warning('Flood protection triggered for mutation @mutation. Too many submissions from IP: @ip (limit: @limit, window: @window)', [
        '@mutation' => $mutation_name,
        '@ip' => $client_ip,
        '@limit' => $ip_limit,
        '@window' => $ip_window,
      ]);
      throw new RateLimitExceededException('Too many submissions.');
    }

    $this->flood->register($flood_key, $ip_window);
  }

  /**
   * Extracts the first IP from X-Forwarded-For header.
   *
   * The X-Forwarded-For header can contain multiple IPs in format:
   * "client, proxy1, proxy2". We want only the client IP (first one).
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   The request object.
   *
   * @return string|null
   *   The first IP address or NULL if not found.
   */
  private function getFirstForwardedFor($request): ?string {
    $forwarded = $request->headers->get('X-Forwarded-For');
    if (!$forwarded) {
      return NULL;
    }

    // Split by comma and get the first IP.
    $ips = explode(',', $forwarded);
    return trim($ips[0]) ?: NULL;
  }

  /**
   * Extracts the mutation name from a GraphQL query.
   *
   * @param string $query
   *   The GraphQL query string.
   *
   * @return string
   *   The mutation name or 'unknown' if not found.
   */
  private function extractMutationName(string $query): string {
    // Try to match the first mutation field name.
    // Pattern matches: mutation { mutationName(...) or mutation Name { mutationName(...)
    if (preg_match('/mutation\s+(?:\w+\s*)?\{\s*(\w+)/', $query, $matches)) {
      return $matches[1];
    }

    // Fallback to 'unknown' if we can't parse the mutation name.
    return 'unknown';
  }

} 