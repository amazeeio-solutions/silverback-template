<?php

declare(strict_types=1);

namespace Drupal\Tests\silverback_ai_import\Kernel;

use Drupal\KernelTests\KernelTestBase;
use Drupal\silverback_ai_import\ContentImportAiService;
use Drupal\Tests\user\Traits\UserCreationTrait;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\file\FileInterface;
use Drupal\Core\File\FileSystemInterface;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\silverback_ai\HttpClient\OpenAiHttpClient;
use Drupal\silverback_ai_import\AiImportPluginManager;
use Drupal\silverback_ai_import\AiPostImportPluginManager;
use Drupal\silverback_ai\AiService;


/**
 * Kernel tests for the ContentImportAiService.
 *
 * @group silverback_ai_import
 */
class ContentImportAiServiceTest extends KernelTestBase {

  use UserCreationTrait;

  /**
   * The ContentImportAiService instance.
   *
   * @var \Drupal\silverback_ai_import\ContentImportAiService
   */
  protected $contentImportAiService;

  /**
   * Modules to enable.
   *
   * @var array
   */
  protected static $modules = [
    'system',
    'user',
    'file',
    'node',
    'image',
    'media',
    'silverback_ai',
    'silverback_ai_test',
    'silverback_ai_import',
  ];

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();

    $this->setUpCurrentUser();

    // Set up required services.
    $this->installEntitySchema('node');
    $this->installEntitySchema('media');
    $this->installEntitySchema('file');
    $this->installSchema('file', ['file_usage']);

    // Mock or load necessary services.
    $route_match = $this->createMock(RouteMatchInterface::class);
    $current_user = $this->createMock(AccountProxyInterface::class);
    $entity_type_manager = $this->createMock(EntityTypeManagerInterface::class);
    $logger_factory = $this->createMock(LoggerChannelFactoryInterface::class);
    $config_factory = $this->createMock(ConfigFactoryInterface::class);
    $openai_http_client = $this->createMock(OpenAiHttpClient::class);
    $plugin_manager = $this->createMock(AiImportPluginManager::class);
    $plugin_manager_post = $this->createMock(AiPostImportPluginManager::class);
    $ai_service = $this->createMock(AiService::class);

    // Instantiate the service.
    $this->contentImportAiService = new ContentImportAiService(
      $route_match,
      $current_user,
      $entity_type_manager,
      $logger_factory,
      $config_factory,
      $openai_http_client,
      $plugin_manager,
      $plugin_manager_post,
      $ai_service
    );
  }

  /**
   * Tests the instantiation of the ContentImportAiService.
   */
  public function testServiceInstantiation(): void {
    // Verify that the service is instantiated and is an instance of ContentImportAiService.
    $service = \Drupal::service('silverback_ai_import.content');
    $this->assertInstanceOf(ContentImportAiService::class, $service);
  }

  /**
   * Tests the processChunk method.
   */
  public function testProcessChunk(): void {
    // @todo find a better way to get proper chunks
    $chunk = [
      "type" => "Header",
      "depth" => 1,
      "children" => [
        [
          "type" => "Text",
          "value" => "Elevate Your Brand for the Digital Age",
          "position" => [],
          "outputDir" => "/tmp/converted/3086c662bff9",
          "htmlValue" => "Elevate Your Brand for the Digital Age"
        ]
      ],
      "position" => [
        "start" => [
          "line" => 1,
          "column" => 1,
          "offset" => 0
        ],
        "end" => [
          "line" => 1,
          "column" => 41,
          "offset" => 40
        ]
      ],
      "raw" => "# Elevate Your Brand for the Digital Age",
      "htmlValue" => "<h1>Elevate Your Brand for the Digital Age</h1>",
      "outputDir" => "/tmp/converted/3086c662bff9",
      "id" => 1,
      "parent" => null
    ];

    $service = \Drupal::service('silverback_ai_import.content');
    $result = $service->processChunk($chunk);
    $this->assertNotEmpty($result);
    $this->assertIsString($result);
    $this->assertStringContainsString('Elevate Your Brand for the Digital Age', $result);
    $this->assertStringContainsString('<h2 class="wp-block-custom-heading', $result);
  }
}
