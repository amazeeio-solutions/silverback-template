<?php

namespace Drupal\silverback_ai_import\Plugin\AiImport;

use Drupal\Core\File\FileSystemInterface;
use Drupal\Core\Plugin\PluginBase;
use Drupal\silverback_ai_import\AiImportPluginManagerInterface;

/**
 * Provides a markdown image to gutenberg block convert plugin.
 *
 * @Plugin(
 *   id = "ai_image",
 *   label = @Translation("Markdown image convert plugin"),
 *   weight = 0,
 * )
 */
class ImageImportPlugin extends PluginBase implements AiImportPluginManagerInterface {

  private const PUBLISHED = 1;

  /**
   * The schema to use.
   *
   * @var array
   */
  private array $schema = [];

  /**
   * The template to use.
   *
   * @var string
   */
  private string $template;

  /**
   * Constructs a \Drupal\Component\Plugin\PluginBase object.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin ID for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition) {
    $this->configuration = $configuration;
    $this->pluginId = $plugin_id;
    $this->pluginDefinition = $plugin_definition;
    $this->schema = $this->getSchema();
    $this->template = $this->getTemplate();
  }

  /**
   * Get a description if the plugin.
   */
  public function description() {
    return $this->t('Convert markdown images to Gutenberg blocks.');
  }

  /**
   * {@inheritDoc}
   */
  public function getSchema() {
    return [
      'mediaId' => 'number',
    ];
  }

  /**
   * {@inheritDoc}
   */
  public function getTemplate() {
    return <<<EOD
    <!-- wp:custom/image-with-text {"mediaEntityIds":["mediaId"]} -->
    <!-- wp:paragraph -->
    <p></p>
    <!-- /wp:paragraph -->
    <!-- /wp:custom/image-with-text -->
    EOD;
  }

  /**
   * {@inheritDoc}
   */
  public function matches(array $chunk) {
    return $chunk['type'] == 'Image';
  }

  /**
   * {@inheritDoc}
   */
  public function convert(array $chunk) {
    // We are using some custom method here.
    // @todo Add a validation method.
    $src = $chunk['src'];
    $media = $this->createMediaImageFromPath($src);
    $data = ['mediaId' => ''];
    if ($media) {
      $data = ['mediaId' => $media->id()];
    }
    return $this->generateBlock($data);
  }

  /**
   * {@inheritDoc}
   */
  public function generateBlock(array $data): string {
    // Validate required keys.
    $required_keys = array_keys($this->getSchema());
    $template = $this->getTemplate();
    foreach ($required_keys as $key) {
      if (!isset($data[$key])) {
        throw new \InvalidArgumentException("Missing required key: {$key}");
      }
    }

    // Create replacement pairs.
    foreach ($required_keys as $key) {
      $replacements[$key] = $data[$key];
    }

    // Perform replacements.
    foreach ($replacements as $key => $value) {
      $template = str_replace($key, $value, $template);
    }

    return $template;
  }

  /**
   * Creates a file entity and a media image entity from a given image path.
   *
   * @param string $image_path
   *   The server path to the image file.
   * @param string $media_bundle
   *   The media bundle type (optional, defaults to 'image').
   * @param int $user_id
   *   The user ID to associate with the created entities (optional, defaults to current user).
   *
   * @return \Drupal\media\MediaInterface|null
   *   The created media entity, or NULL if creation fails.
   *
   * @throws \Drupal\Core\Entity\EntityStorageException
   */
  public function createMediaImageFromPath($image_path, $media_bundle = 'image', $user_id = NULL) {
    // Ensure the file exists.
    if (!file_exists($image_path)) {
      \Drupal::logger('image_import')->error('File does not exist: @path', ['@path' => $image_path]);
      return NULL;
    }

    // Get the current user if no user ID is provided.
    if ($user_id === NULL) {
      $user_id = \Drupal::currentUser()->id();
    }

    // Prepare the file.
    $file_uri = 'public://' . basename($image_path);

    try {
      // Create file entity.
      $file = \Drupal::service('file.repository')->writeData(
      file_get_contents($image_path),
      $file_uri,
      FileSystemInterface::EXISTS_REPLACE
      );

      // Set file status to permanent.
      if ($file) {
        $file->setPermanent();
        $file->save();
      }
      else {
        \Drupal::logger('image_import')->error('Failed to create file entity for: @path', ['@path' => $image_path]);
        return NULL;
      }

      // Create media entity.
      $media_storage = \Drupal::entityTypeManager()->getStorage('media');
      /** @var  \Drupal\media\Entity\media $media */
      $media = $media_storage->create([
        'bundle' => $media_bundle,
        'name' => $file->getFilename(),
        'uid' => $user_id,
        'status' => self::PUBLISHED,
        'field_media_image' => [
          'target_id' => $file->id(),
          // @todo Improve alt text generation.
          'alt' => $file->getFilename(),
          'title' => $file->getFilename(),
        ],
      ]);

      $media->save();
      return $media;
    }
    catch (\Exception $e) {
      \Drupal::logger('image_import')->error('Error creating media entity: @error', ['@error' => $e->getMessage()]);
      return NULL;
    }
  }

}
