<?php

namespace Drupal\Tests\silverback_search\Unit\Plugin\search_api\processor;

use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Url;
use Drupal\search_api\Item\ItemInterface;
use Drupal\silverback_external_preview\ExternalPreviewLink;
use Drupal\silverback_search\Plugin\search_api\processor\RemoteRenderedItem;
use Drupal\Tests\UnitTestCase;
use GuzzleHttp\Client;
use GuzzleHttp\Psr7\Response;
use GuzzleHttp\RequestOptions;
use Psr\Log\LoggerInterface;
use Prophecy\PhpUnit\ProphecyTrait;
use Prophecy\Argument;

class RemoteRenderedItemTest extends UnitTestCase {
  use ProphecyTrait;

  /**
   * @dataProvider getHtmlProvider
   * @covers \Drupal\silverback_search\Plugin\search_api\processor\RemoteRenderedItem::getHtml
   */
  public function testGetHtml(
    array $config,
    $entity,
    string $expectedResult,
    ?string $previewUrl,
    ?array $httpResponses,
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
    if ($httpResponses) {
      foreach ($httpResponses as $method => $args) {
        $httpClient->$method(...$args['args'])->willReturn($args['response']);
      }
    } else {
      $httpClient->get(Argument::any())->shouldNotBeCalled();
      $httpClient->request(Argument::cetera())->shouldNotBeCalled();
    }

    $logger = $this->prophesize(LoggerInterface::class);
    if ($expectedError) {
      $logger->error($expectedError['message'], Argument::any())->shouldBeCalled();
    } else {
      $logger->error(Argument::cetera())->shouldNotBeCalled();
    }

    $processor = new RemoteRenderedItem(
      $config,
      'silverback_remote_rendered_item',
      [],
      $externalPreviewLink->reveal(),
      $logger->reveal()
    );

    $reflection = new \ReflectionClass($processor);
    $property = $reflection->getProperty('httpClient');
    $property->setAccessible(true);
    $property->setValue($processor, $httpClient->reveal());

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

    return [
      'success_case' => [
        $config,
        $contentEntity->reveal(),
        '<main><h1>Test Content</h1></main>',
        $previewUrl,
        [
          'get' => [
            'args' => [$previewUrl],
            'response' => new Response(200, [], $successHtml),
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
          'get' => [
            'args' => [$previewUrl],
            'response' => new Response(401),
          ],
          'request' => [
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
          'get' => [
            'args' => [$previewUrl],
            'response' => new Response(401),
          ],
        ],
        [
          'message' => 'Could not fetch the remote rendered item because Netlify password is not set. Debug:<pre>{debug}</pre>',
        ],
      ],
      '401_wrong_password' => [
        $configWithPassword,
        $contentEntity->reveal(),
        '',
        $previewUrl,
        [
          'get' => [
            'args' => [$previewUrl],
            'response' => new Response(401),
          ],
          'request' => [
            'args' => [
              'POST',
              $previewUrl,
              [RequestOptions::FORM_PARAMS => ['password' => 'secret123']],
            ],
            'response' => new Response(401),
          ],
        ],
        [
          'message' => 'Could not fetch the remote rendered item because Netlify password is incorrect. Debug:<pre>{debug}</pre>',
        ],
      ],
      'non_200_response' => [
        $config,
        $contentEntity->reveal(),
        '',
        $previewUrl,
        [
          'get' => [
            'args' => [$previewUrl],
            'response' => new Response(500),
          ],
        ],
        [
          'message' => 'Could not fetch the remote rendered item because the response status code is {status_code}. Debug:<pre>{debug}</pre>',
        ],
      ],
      'selector_not_found' => [
        $configWithWrongSelector,
        $contentEntity->reveal(),
        '',
        $previewUrl,
        [
          'get' => [
            'args' => [$previewUrl],
            'response' => new Response(200, [], $successHtml),
          ],
        ],
        [
          'message' => 'Root selector `{root_selector}` did not match any elements on the page. Debug:<pre>{debug}</pre>',
        ],
      ],
    ];
  }
}
