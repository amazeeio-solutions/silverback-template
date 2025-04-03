<?php

namespace Drupal\Tests\silverback_search\Unit\Plugin\search_api\processor;

use Drupal\Core\Database\Connection;
use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Url;
use Drupal\silverback_external_preview\ExternalPreviewLink;
use Drupal\silverback_search\Plugin\search_api\processor\RemoteRenderedItem;
use Drupal\Tests\UnitTestCase;
use GuzzleHttp\Client;
use GuzzleHttp\Psr7\Response;
use GuzzleHttp\RequestOptions;
use Prophecy\Argument;
use Prophecy\PhpUnit\ProphecyTrait;
use Psr\Log\LoggerInterface;

class RemoteRenderedItemTest extends UnitTestCase {
  use ProphecyTrait;

  /**
   * @dataProvider getHtmlProvider
   * @covers \Drupal\silverback_search\Plugin\search_api\processor\RemoteRenderedItem::getHtml
   */
  public function testGetHtml(
    array $config,
    ContentEntityInterface $entity,
    string $expectedResult,
    ?string $previewUrl,
    ?array $requests,
    ?array $expectedError
  ): void {
    $externalPreviewLink = $this->prophesize(ExternalPreviewLink::class);
    if ($previewUrl) {
      $url = $this->prophesize(Url::class);
      $url->toString()->willReturn($previewUrl);
      $externalPreviewLink->createPreviewUrlFromEntity($entity, 'live')->willReturn($url->reveal());
    } else {
      $externalPreviewLink->createPreviewUrlFromEntity($entity, 'live')->willReturn(null);
    }

    $httpClient = $this->prophesize(Client::class);
    if ($requests) {
      foreach ($requests as $request) {
        $httpClient->request(...$request['args'])->willReturn($request['response']);
      }
    } else {
      $httpClient->request(Argument::cetera())->shouldNotBeCalled();
    }

    $logger = $this->prophesize(LoggerInterface::class);
    if ($expectedError) {
      $logger->error($expectedError['message'], Argument::any())->shouldBeCalled();
    } else {
      $logger->error(Argument::cetera())->shouldNotBeCalled();
    }

    $database = $this->prophesize(Connection::class);

    $processor = new RemoteRenderedItem(
      $config,
      'silverback_remote_rendered_item',
      [],
      $externalPreviewLink->reveal(),
      $logger->reveal(),
      $database->reveal()
    );

    $reflection = new \ReflectionClass($processor);
    $property = $reflection->getProperty('httpClient');
    $property->setAccessible(true);
    $property->setValue($processor, $httpClient->reveal());

    $passwordProperty = $reflection->getProperty('netlifyPassword');
    $passwordProperty->setAccessible(true);
    $passwordProperty->setValue($processor, $config['netlify_password']);

    $method = $reflection->getMethod('getHtml');
    $method->setAccessible(true);

    $result = $method->invoke($processor, $entity, $config);
    $this->assertEquals($expectedResult, $result);
  }

  public function getHtmlProvider(): array {
    $config = [
      'entity_types' => ['node'],
      'root_selector' => 'main',
      'netlify_password' => null,
    ];

    $configWithExclude = [
      'entity_types' => ['node'],
      'root_selector' => 'main',
      'exclude_selector' => 'main > .pre-footer, .exclude',
      'netlify_password' => null,
    ];

    $contentEntity = $this->prophesize(ContentEntityInterface::class);
    $contentEntity->getEntityTypeId()->willReturn('node');
    $contentEntity->id()->willReturn('1');

    $mediaEntity = $this->prophesize(ContentEntityInterface::class);
    $mediaEntity->getEntityTypeId()->willReturn('media');
    $mediaEntity->id()->willReturn('1');

    $configWithPassword = [
      'entity_types' => ['node'],
      'root_selector' => 'main',
      'netlify_password' => 'secret123',
    ];

    $configWithWrongSelector = [
      'entity_types' => ['node'],
      'root_selector' => '#nonexistent',
      'netlify_password' => null,
    ];

    $previewUrl = 'https://example.com/preview/123';
    $successHtml = '<html><body><main><h1>Test Content</h1></main></body></html>';
    $htmlWithExclude = preg_replace('/>\s+</', '><', '
      <html>
        <body>
          <main>
            <h1>Test Content</h1>
            <div class="exclude">First to exclude</div>
            <div class="exclude">Second to exclude</div>
            <div class="content">Content to keep</div>
            <div class="pre-footer">Pre-footer to exclude</div>
          </main>
        </body>
      </html>
    ');

    return [
      'success_case' => [
        $config,
        $contentEntity->reveal(),
        '<main><h1>Test Content</h1></main>',
        $previewUrl,
        [
          [
            'args' => ['GET', $previewUrl],
            'response' => new Response(200, [], $successHtml),
          ],
        ],
        null,
      ],
      'success_with_exclude' => [
        $configWithExclude,
        $contentEntity->reveal(),
        '<main><h1>Test Content</h1><div class="content">Content to keep</div></main>',
        $previewUrl,
        [
          [
            'args' => ['GET', $previewUrl],
            'response' => new Response(200, [], $htmlWithExclude),
          ],
        ],
        null,
      ],
      'wrong_entity_type' => [
        $config,
        $mediaEntity->reveal(),
        '',
        null,
        null,
        null,
      ],
      'no_preview_url' => [
        $config,
        $contentEntity->reveal(),
        '',
        null,
        null,
        null,
      ],
      'success_with_401_then_auth' => [
        $configWithPassword,
        $contentEntity->reveal(),
        '<main><h1>Test Content</h1></main>',
        $previewUrl,
        [
          [
            'args' => ['GET', $previewUrl],
            'response' => new Response(401),
          ],
          [
            'args' => [
              'POST',
              $previewUrl,
              [RequestOptions::FORM_PARAMS => ['password' => 'secret123']],
            ],
            'response' => new Response(200, [], $successHtml),
          ],
        ],
        null,
      ],
      '401_no_password' => [
        $config,
        $contentEntity->reveal(),
        '',
        $previewUrl,
        [
          [
            'args' => ['GET', $previewUrl],
            'response' => new Response(401),
          ],
        ],
        [
          'message' => 'Could not get HTML: {error}. Debug:<pre>{debug}</pre>',
        ],
      ],
      '401_wrong_password' => [
        $configWithPassword,
        $contentEntity->reveal(),
        '',
        $previewUrl,
        [
          [
            'args' => ['GET', $previewUrl],
            'response' => new Response(401),
          ],
          [
            'args' => [
              'POST',
              $previewUrl,
              [RequestOptions::FORM_PARAMS => ['password' => 'secret123']],
            ],
            'response' => new Response(401),
          ],
        ],
        [
          'message' => 'Could not get HTML: {error}. Debug:<pre>{debug}</pre>',
        ],
      ],
      'non_200_response' => [
        $config,
        $contentEntity->reveal(),
        '',
        $previewUrl,
        [
          [
            'args' => ['GET', $previewUrl,],
            'response' => new Response(500),
          ],
        ],
        [
          'message' => 'Could not get HTML: {error}. Debug:<pre>{debug}</pre>',
        ],
      ],
      'selector_not_found' => [
        $configWithWrongSelector,
        $contentEntity->reveal(),
        '',
        $previewUrl,
        [
          [
            'args' => ['GET', $previewUrl,],
            'response' => new Response(200, [], $successHtml),
          ],
        ],
        [
          'message' => 'Root selector `{root_selector}` did not match any elements on the page. Debug:<pre>{debug}</pre>',
        ],
      ],
    ];
  }

  /**
   * @dataProvider isOutdatedProvider
   * @covers \Drupal\silverback_search\Plugin\search_api\processor\RemoteRenderedItem::isOutdated
   */
  public function testIsOutdated(
    bool $expectedResult,
    ?int $buildId,
    int $updateCount,
    string $entityUuid
  ): void {
    $externalPreviewLink = $this->prophesize(ExternalPreviewLink::class);
    $externalPreviewLink->getLiveBaseUrl()->willReturn('https://example.com');

    $httpClient = $this->prophesize(Client::class);
    if ($buildId !== null) {
      $httpClient->request('GET', 'https://example.com/build.json')
        ->willReturn(new Response(200, [], json_encode(['drupalBuildId' => $buildId])));
    }

    $logger = $this->prophesize(LoggerInterface::class);
    $database = $this->prophesize(Connection::class);

    $processor = $this->getMockBuilder(RemoteRenderedItem::class)
      ->setConstructorArgs([
        [],
        'silverback_remote_rendered_item',
        [],
        $externalPreviewLink->reveal(),
        $logger->reveal(),
        $database->reveal(),
      ])
      ->onlyMethods(['getUpdateCount'])
      ->getMock();

    if ($buildId !== null) {
      $processor->expects($this->once())
        ->method('getUpdateCount')
        ->with($entityUuid, $buildId)
        ->willReturn($updateCount);
    } else {
      $processor->expects($this->never())
        ->method('getUpdateCount');
    }

    $reflection = new \ReflectionClass($processor);
    $property = $reflection->getProperty('httpClient');
    $property->setAccessible(true);
    $property->setValue($processor, $httpClient->reveal());

    $method = $reflection->getMethod('isOutdated');
    $method->setAccessible(true);

    $entity = $this->prophesize(ContentEntityInterface::class);
    $entity->uuid()->willReturn($entityUuid);

    $result = $method->invoke($processor, $entity->reveal());
    $this->assertEquals($expectedResult, $result);
  }

  public function isOutdatedProvider(): array {
    return [
      'entity_is_outdated' => [
        true,
        100,
        1,
        'test-uuid',
      ],
      'entity_is_not_outdated' => [
        false,
        100,
        0,
        'test-uuid',
      ],
      'no_build_id' => [
        false,
        null,
        0,
        'test-uuid',
      ],
    ];
  }

  /**
   * @dataProvider getBuildIdProvider
   * @covers \Drupal\silverback_search\Plugin\search_api\processor\RemoteRenderedItem::getBuildId
   */
  public function testGetBuildId(
    ?int $expectedResult,
    ?Response $response,
    bool $shouldLogError,
    ?string $expectedErrorMessage = null
  ): void {
    $externalPreviewLink = $this->prophesize(ExternalPreviewLink::class);
    $externalPreviewLink->getLiveBaseUrl()->willReturn('https://example.com');

    $httpClient = $this->prophesize(Client::class);
    if ($response) {
      $httpClient->request('GET', 'https://example.com/build.json')
        ->willReturn($response);
    } else {
      $httpClient->request('GET', 'https://example.com/build.json')
        ->willThrow(new \Exception('Connection error'));
    }

    $logger = $this->prophesize(LoggerInterface::class);
    if ($shouldLogError) {
      $logger->error($expectedErrorMessage, Argument::any())->shouldBeCalled();
    } else {
      $logger->error(Argument::cetera())->shouldNotBeCalled();
    }

    $database = $this->prophesize(Connection::class);

    $processor = new RemoteRenderedItem(
      [],
      'silverback_remote_rendered_item',
      [],
      $externalPreviewLink->reveal(),
      $logger->reveal(),
      $database->reveal()
    );

    $reflection = new \ReflectionClass($processor);
    $property = $reflection->getProperty('httpClient');
    $property->setAccessible(true);
    $property->setValue($processor, $httpClient->reveal());

    $method = $reflection->getMethod('getBuildId');
    $method->setAccessible(true);

    $result = $method->invoke($processor);
    $this->assertEquals($expectedResult, $result);

    if ($expectedResult !== null) {
      $cachedResult = $method->invoke($processor);
      $this->assertEquals($expectedResult, $cachedResult);
      $httpClient->request('GET', 'https://example.com/build.json')->shouldHaveBeenCalledOnce();
    }
  }

  public function getBuildIdProvider(): array {
    return [
      'success_case' => [
        100,
        new Response(200, [], json_encode(['drupalBuildId' => 100])),
        false,
      ],
      'non_200_response' => [
        null,
        new Response(500),
        true,
        'Could not get build ID: {error}. URL: {url}',
      ],
      'missing_build_id' => [
        null,
        new Response(200, [], json_encode(['foo' => 'bar'])),
        false,
      ],
      'invalid_build_id' => [
        null,
        new Response(200, [], json_encode(['drupalBuildId' => 0])),
        false,
      ],
      'exception_case' => [
        null,
        null,
        true,
        'Could not fetch build ID: {error}',
      ],
    ];
  }
}
