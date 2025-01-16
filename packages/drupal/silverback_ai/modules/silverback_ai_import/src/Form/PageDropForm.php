<?php

declare(strict_types=1);

namespace Drupal\silverback_ai_import\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Render\Markup;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\silverback_ai_import\ContentImportAiService;

/**
 * Provides a Silverback Import AI form.
 */
final class PageDropForm extends FormBase {

  use StringTranslationTrait;

  /**
   * {@inheritdoc}
   */
  public function getFormId(): string {
    return 'silverback_ai_import_page_drop';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {

    // End debug
    // ---------------------.
    $form['message'] = [
      '#type' => 'item',
      '#markup' => Markup::create('<em>Create content by importing either a file or an existing URL.</em>'),
    ];

    $form['import'] = [
      '#type' => 'details',
      '#title' => $this->t('Create content'),
      '#open' => TRUE,
      '#weight' => 99,
    ];
    $form['import']['import_type'] = [
      '#type' => 'radios',
      '#title' => $this->t('Create content from:'),
      '#description' => $this->t('<em>* Experimental, use with caution</em>'),
      '#options' => [
        'docx' => $this->t('Microsoft Word file'),
        'pdf' => $this->t("PDF file (*)"),
        'url' => $this->t("Remote web page (*)"),
      ],
      '#default_value' => 'none',
      '#required' => TRUE,
    ];

    $form['import']['container_docx'] = [
      '#type' => 'container',
      '#states' => [
        'visible' => [
          'input[name="import_type"]' => ['value' => 'docx'],
        ],
      ],
    ];

    $form['import']['container_docx']['file'] = [
      '#title' => $this->t('Drag and drop a Microsoft Word file'),
      '#type' => 'dropzonejs',
      '#required' => TRUE,
      '#dropzone_description' => 'Drag and drop a file here',
      '#max_filesize' => '1M',
      '#max_files' => 1,
      '#extensions' => 'doc docx',
      '#upload_location' => 'public://converted/',
      '#states' => [
        'required' => [
          'input[name="import_type"]' => ['value' => 'docx'],
        ],
      ],
    ];

    $form['import']['container_url'] = [
      '#type' => 'container',
      '#states' => [
        'visible' => [
          'input[name="import_type"]' => ['value' => 'url'],
        ],
      ],
    ];

    $form['import']['container_url']['url_value'] = [
      '#type' => 'url',
      '#title' => $this->t('URL'),
      '#maxlength' => 2048,
      '#size' => 128,
      '#states' => [
        'required' => [
          'input[name="import_type"]' => ['value' => 'url'],
        ],
      ],
    ];

    $form['import']['container_pdf'] = [
      '#type' => 'container',
      '#states' => [
        'visible' => [
          'input[name="import_type"]' => ['value' => 'pdf'],
        ],
      ],
    ];

    $form['import']['container_pdf']['pdf_file'] = [
      '#title' => $this->t('Drag and drop a PDF file'),
      '#type' => 'dropzonejs',
      '#required' => TRUE,
      '#dropzone_description' => 'Drag and drop a file here',
      '#max_filesize' => '24M',
      '#max_files' => 1,
      '#extensions' => 'pdf',
      '#upload_location' => 'public://converted/',
      '#states' => [
        'required' => [
          'input[name="import_type"]' => ['value' => 'pdf'],
        ],
      ],
    ];

    $form['import']['container_output'] = [
      '#type' => 'container',
    ];
    $form['import']['container_output']['output'] = [
      '#type' => 'item',
      '#prefix' => '<div id="edit-output">',
      '#suffix' => '</div>',
    ];

    $form['actions'] = [
      '#type' => 'actions',
      '#states' => [
        'visible' => [
          'input[name="import_type"]' => ['value' => 'docx'],
        ],
      ],
      'submit' => [
        '#type' => 'submit',
        '#value' => $this->t('Import document'),
      ],
    ];

    $form['actions_url'] = [
      '#type' => 'actions',
      '#states' => [
        'visible' => [
          'input[name="import_type"]' => ['value' => 'url'],
        ],
      ],
      'submit' => [
        '#type' => 'submit',
        '#value' => $this->t('Import web page'),
      ],
    ];

    $form['actions_pdf'] = [
      '#type' => 'actions',
      '#states' => [
        'visible' => [
          'input[name="import_type"]' => ['value' => 'pdf'],
        ],
      ],
      'submit' => [
        '#type' => 'submit',
        '#value' => $this->t('Import PDF'),
      ],
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state): void {
    $file = $form_state->getValue('file');
    $pdf_file = $form_state->getValue('pdf_file');

    $type = $form_state->getValue('import_type');
    if ($type == 'docx' && empty($file['uploaded_files'])) {
      $form_state->setErrorByName('file', $this->t('Please upload a file to import.'));
    }
    if ($type == 'pdf' && empty($pdf_file['uploaded_files'])) {
      $form_state->setErrorByName('file', $this->t('Please upload a PDF to import.'));
    }
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {

    /** @var \Drupal\Core\Entity\EntityInterface $entity */

    $url_value = $form_state->getValue('url_value');

    $service = \Drupal::service('silverback_ai_import.content');
    $content = \Drupal::service('silverback_ai_import.batch.import');
    $type = $form_state->getValue('import_type');
    $contentImportLogger = \Drupal::service('silverback_ai_imoprt.logger');

    switch ($type) {
      case ContentImportAiService::PDF:
        $file = $form_state->getValue('pdf_file');
        break;
      case ContentImportAiService::URL:
        $file = $url_value;
        break;
      case ContentImportAiService::NONE:
        break;
      default:
        $file = $form_state->getValue('file');
    }

    if (in_array($type, [ContentImportAiService::DOCX, ContentImportAiService::PDF])) {
      $file = $service->createFileEntityFromDropzoneData($file);
    }

    if (!empty($file)) {
      $ast = $service->getAst($file, $type);
      $entity = NULL;

      switch ($type) {
        case ContentImportAiService::PDF:
          $entity = $service->createEntityFromDocxAst($ast);
          break;
        case ContentImportAiService::URL:
          $entity = $service->createEntityFromUrl($file);
          break;
        default:
          $entity = $service->createEntityFromDocxAst($ast);
      }

      $flatten = $service->flattenAst($ast->content);
      $content->create($flatten, $entity);
      $contentImportLogger->createEntry($ast, $entity, $file->getFileUri());
      $form_state->setRedirectUrl($entity->toUrl('edit-form'));
    }
  }
}
