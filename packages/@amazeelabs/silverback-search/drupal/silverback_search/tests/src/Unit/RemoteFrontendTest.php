<?php

namespace Drupal\Tests\silverback_search\Unit;

use Drupal\silverback_external_preview\ExternalPreviewLink;
use Drupal\silverback_search\FetchResult;
use Drupal\silverback_search\Service\RemoteFrontend;
use Drupal\Core\Database\Connection;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\Core\Logger\LoggerChannel;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use GuzzleHttp\Psr7\Request;
use GuzzleHttp\Psr7\Response;
use GuzzleHttp\RequestOptions;
use PHPUnit\Framework\TestCase;
use Prophecy\Argument;
use Prophecy\PhpUnit\ProphecyTrait;

class RemoteFrontendTest extends TestCase {
  
  use ProphecyTrait;

  /**
   * Data provider for testGetFromRemote.
   */
  public function getFromRemoteDataProvider() {
    $url = 'https://example.com';
    
    return [
      'successful response' => [
        'requests' => [
          [
            'args' => ['GET', $url],
            'response' => new Response(200, [], "Test content"),
          ],
        ],
        'password' => '',
        'url' => $url,
        'expected' => new FetchResult("Test content", NULL),
      ],
      '401 response with no password' => [
        'requests' => [
          [
            'args' => ['GET', $url],
            'response' => new Response(401),
          ],
        ],
        'password' => NULL,
        'url' => $url,
        'expected' => new FetchResult(NULL, 'Could not fetch from remote because Netlify password is not set.'),
      ],
      '401 response with incorrect password' => [
        'requests' => [
          [
            'args' => ['GET', $url],
            'response' => new Response(401),
          ],
          [
            'args' => [
              'POST',
              $url,
              [RequestOptions::FORM_PARAMS => ['password' => 'wrong-password']],
            ],
            'response' => new Response(401),
          ],
        ],
        'password' => 'wrong-password',
        'url' => $url,
        'expected' => new FetchResult(NULL, 'Could not fetch from remote because Netlify password is incorrect.'),
      ],
      '401 response with successful auth' => [
        'requests' => [
          [
            'args' => ['GET', $url],
            'response' => new Response(401),
          ],
          [
            'args' => [
              'POST',
              $url,
              [RequestOptions::FORM_PARAMS => ['password' => 'correct-password']],
            ],
            'response' => new Response(200, [], "Test content after authentication"),
          ],
        ],
        'password' => 'correct-password',
        'url' => $url,
        'expected' => new FetchResult("Test content after authentication", NULL),
      ],
      'non-success response (404)' => [
        'requests' => [
          [
            'args' => ['GET', $url],
            'response' => new Response(404),
          ],
        ],
        'password' => '',
        'url' => $url,
        'expected' => new FetchResult(NULL, 'Could not fetch from remote because the response status code is 404.'),
      ],
      'request exception' => [
        'requests' => [
          [
            'args' => ['GET', $url],
            'response' => new RequestException('Network error', new Request('GET', $url)),
          ],
        ],
        'password' => '',
        'url' => $url,
        'expected' => new FetchResult(NULL, 'Could not fetch from remote: Network error'),
      ],
    ];
  }

  /**
   * @dataProvider getFromRemoteDataProvider
   */
  public function testGetFromRemote($requests, $password, $url, $expected) {
    $httpClient = $this->prophesize(Client::class);
    if ($requests) {
      foreach ($requests as $request) {
        if ($request['response'] instanceof \Exception) {
          $httpClient->request(...$request['args'])->willThrow($request['response']);
        } else {
          $httpClient->request(...$request['args'])->willReturn($request['response']);
        }
      }
    } else {
      $httpClient->request(Argument::cetera())->shouldNotBeCalled();
    }
    
    $externalPreviewLink = $this->prophesize(ExternalPreviewLink::class);
    $loggerChannel = $this->prophesize(LoggerChannel::class);
    $loggerFactory = $this->prophesize(LoggerChannelFactoryInterface::class);
    $loggerFactory->get(Argument::any())->willReturn($loggerChannel->reveal());
    $database = $this->prophesize(Connection::class);
    
    $remoteFrontend = new RemoteFrontend(
      $externalPreviewLink->reveal(),
      $loggerFactory->reveal(),
      $database->reveal()
    );
    
    $reflection = new \ReflectionClass($remoteFrontend);
    $property = $reflection->getProperty('httpClient');
    $property->setAccessible(true);
    $property->setValue($remoteFrontend, $httpClient->reveal());
    
    $remoteFrontend->setNetlifyPassword($password);
    
    $method = new \ReflectionMethod(RemoteFrontend::class, 'getFromRemote');
    $method->setAccessible(true);
    
    $result = $method->invoke($remoteFrontend, $url);
    
    $this->assertInstanceOf(FetchResult::class, $result);
    $this->assertEquals($expected->content, $result->content);
    $this->assertEquals($expected->error, $result->error);
  }
} 
