<?php

namespace Drupal\custom;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Render\RenderContext;
use Drupal\Core\Render\RendererInterface;
use Drupal\graphql_directives\Api;
use Drupal\webform\WebformSubmissionForm;
use Drupal\webform\WebformSubmissionInterface;
use Symfony\Component\Serializer\Serializer;
use Symfony\Component\Serializer\SerializerInterface;

/**
 * Helper service for managing webforms with graphql.
 */
class Webform {

  /**
   * The renderer for collecting cache information.
   */
  protected RendererInterface $renderer;

  /**
   * The entity type manager, to query and load pages.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected EntityTypeManagerInterface $entityTypeManager;

  /**
   * The serializer serice.
   *
   * @var \Symfony\Component\Serializer\SerializerInterface
   */
  protected Serializer $serializer;

  /**
   * Webform constructor.
   */
  public function __construct(
    RendererInterface $renderer,
    EntityTypeManagerInterface $entityTypeManager,
    SerializerInterface $serializer,
  ) {
    $this->entityTypeManager = $entityTypeManager;
    $this->renderer = $renderer;
    $this->serializer = $serializer;
  }

  /**
   * Generate the public url of a webform, based on its ID.
   */
  public function url(Api $api) : ?string {
    $webformId = $api->args['id'];
    if (!$webformId) {
      return NULL;
    }

    $webFormStorage = $this->entityTypeManager->getStorage('webform');

    /** @var \Drupal\Core\Render\RendererInterface $renderer */
    $renderContext = new RenderContext();

    $result = $this->renderer->executeInRenderContext(
        $renderContext,
        function () use ($api, $webformId, $webFormStorage) {
          $webform = $webFormStorage->load($webformId);
          if (!$webform || !$webform->isOpen()) {
            return NULL;
          }
          $api->context->addCacheableDependency($webform);
          return $webform->toUrl()->setAbsolute()->toString();
        },
      );

    if (!$renderContext->isEmpty()) {
      $api->context->addCacheableDependency($renderContext->pop());
    }

    return $result;
  }

  /**
   * Directive to create a webform submission.
   */
  public function createSubmission(Api $api) : array {
    try {
      $webformId = $api->args['webformId'];
      $webform = $this->entityTypeManager->getStorage('webform')
        ->load($webformId);
      if (!$webform) {
        throw new \InvalidArgumentException('The webform could no be loaded.');
      }
      $isOpen = WebformSubmissionForm::isOpen($webform);
      if ($isOpen !== TRUE) {
        throw new \Exception($isOpen);
      }
      $submittedData = $api->args['submittedData'];
      $values = [
        'webform_id' => $webformId,
        'entity_type' => NULL,
        'entity_id' => NULL,
        'data' => $this->serializer->decode($submittedData, 'json'),
      ];
      // The WebformSubmissionForm::submitFormValues() will return an array with
      // errors, if there are validation errors, otherwise it will return a
      // webform submission entity.
      $webformSubmission = WebformSubmissionForm::submitFormValues($values);

      // If we get an array from the createSubmission call, then it means there
      // were errors during the insert / validate operation, so we just return
      // them.
      if (is_array($webformSubmission)) {
        return [
          'errors' => $this->formatErrors($webformSubmission),
          'submission' => NULL,
        ];
      }

      // We successfully submitted the data.
      if (is_object($webformSubmission) && $webformSubmission instanceof WebformSubmissionInterface) {
        $webformSubmissionData = $webformSubmission->getData();
        return [
          'errors' => NULL,
          'submission' => $this->serializer->encode(array_merge([
            'submissionId' => $webformSubmission->id(),
          ], $webformSubmissionData), 'json'),
        ];
      }
    }
    catch (\InvalidArgumentException $e) {
      return [
        'submission' => NULL,
        'errors' => [
          [
            'message' => $e->getMessage(),
            'key' => 'invalid_webform',
          ],
        ],
      ];
    }
    catch (\Exception $e) {
      return [
        'submission' => NULL,
        'errors' => [
          [
            'message' => $e->getMessage(),
            'key' => 'invalid_input',
          ],
        ],
      ];
    }

    // We should actually never get here... if we do, we don't know what
    // happened.
    return [
      'submission' => NULL,
      'errors' => [
        [
          'message' => 'Unknown error',
          'key' => 'unknown_error',
        ],
      ],
    ];

  }

  /**
   * Helper method to arrange webform submission errors for GraphQL.
   *
   * Arranges a set of webform submission errors in a way that can be used by
   * the MutationError GraphQL type.
   */
  protected function formatErrors(array $webformSubmissionErrors) {
    $formattedErrors = [];
    foreach ($webformSubmissionErrors as $fieldName => $error) {
      $formattedErrors[] = [
        'message' => $error->__toString(),
        'key' => 'invalid_field_' . $fieldName,
        'field' => $fieldName,
      ];
    }
    return $formattedErrors;
  }

}
