<?php

declare(strict_types=1);

namespace Drupal\custom;

use Drupal\Core\Language\LanguageInterface;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\Core\Render\RenderContext;
use Drupal\Core\Render\RendererInterface;
use Drupal\Core\StreamWrapper\LocalStream;
use Drupal\Core\StreamWrapper\StreamWrapperInterface;
use Drupal\Core\StreamWrapper\StreamWrapperManagerInterface;
use Drupal\Core\Utility\Error as ErrorUtil;
use Drupal\file\Entity\File;
use Drupal\file\FileUsage\DatabaseFileUsageBackend;
use Drupal\media\Entity\Media;

final class MediaLinks {

  /**
   * Constructs a MediaLinks object.
   */
  public function __construct(
    private readonly RendererInterface $renderer,
    private readonly LoggerChannelFactoryInterface $loggerFactory,
    private readonly StreamWrapperManagerInterface $streamWrapperManager,
    private readonly DatabaseFileUsageBackend $fileUsage,
  ) {}

  /**
   * Returns a File url based on the parent Media path.
   *
   * @param string $url
   *   The Media relative url.
   * @param \Drupal\Core\Language\LanguageInterface $language
   *   The language of the Media translation to use.
   * @param array $media_bundles
   *   An array of allowed media bundles.
   * @return string
   */
  public function getMediaFileUrl(
    string $url,
    LanguageInterface $language,
    array $media_bundles = ['document']
  ): string {
    if (preg_match('#^(/[a-z]{2})?/media/([0-9]+)(/edit)?$#', $url, $matches)) {
      $this->renderer->executeInRenderContext(
        new RenderContext(),
        function () use (&$url, $matches, $language, $media_bundles) {
          $mediaId = $matches[2];
          try {
            /** @var \Drupal\media\MediaInterface $media */
            $media = Media::load($mediaId);
            if (
              $language->getId() !== $media->language()->getId() &&
              $media->hasTranslation($language->getId())
            ) {
              $media = $media->getTranslation($language->getId());
            }
            if (
              in_array($media->bundle(), $media_bundles) &&
              $media->access('view')
            ) {
              $source = $media->getSource()->getSourceFieldValue($media);
              $file = File::load($source);
              $url = $file->createFileUrl();
            }
          }
          catch (\Throwable $e) {
            $this->loggerFactory->get('custom')->error(
              'Error turning media (id: "{mediaId}") route into file url. Error: {error}',
              [
                'mediaId' => $mediaId,
                'error' => ErrorUtil::renderExceptionSafe($e),
              ]
            );
          }
        }
      );
    }

    return $url;
  }

  /**
   * Processes inbound links altered by outbound_url_alter() / useMediaFileUrl().
   *
   * For inbound links (when data gets saved), if the link points to a public
   * file, then we want to replace the href value with "media/uuid/edit" and
   * also make sure the data-id and data-entity-type attributes have the proper
   * values (the uuid and the 'media' value). This is a special case for media,
   * because the url of the media item is replaced by
   * custom_silverback_gutenberg_link_processor_outbound_url_alter() with the
   * file path, so now on inbound we need to basically do the opposite. This is
   * needed so that the entity usage integration works properly (where the
   * data-id and data-entity-type attributes are checked).
   *
   * @param \DOMElement $link
   *
   * @return void
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   */
  public function processInboundLink(\DOMElement $link): void {
    $href = $link->getAttribute('href');
    /** @var \Drupal\Core\StreamWrapper\StreamWrapperInterface[] $visibleWrappers */
    $visibleWrappers = $this->streamWrapperManager->getWrappers(StreamWrapperInterface::VISIBLE);
    foreach ($visibleWrappers as $scheme => $wrapperInfo) {
      $wrapper = $this->streamWrapperManager->getViaScheme($scheme);
      // We are only handling local streams for now.
      if (!$wrapper instanceof LocalStream) {
        continue;
      }
      if (!str_starts_with($href, '/' . $wrapper->getDirectoryPath() . '/')) {
        continue;
      }
      // When searching for a file inside the database, the wrapper uri is used
      // instead of the directory path. That is why we need the wrapper in the
      // first place.
      $fileUri = str_replace('/' . $wrapper->getDirectoryPath() . '/', $wrapper->getUri(), urldecode($href));
      $files = \Drupal::entityTypeManager()
        ->getStorage('file')
        ->loadByProperties(['uri' => $fileUri]);
      // No files found, just continue to the next wrapper.
      if (empty($files)) {
        continue;
      }
      $file = array_shift($files);
      $usageList = $this->fileUsage->listUsage($file);
      // If the media file usage list is empty, then this is probably some kind of
      // orphan file, or tracked by some other entity type.
      if (empty($usageList['file']['media'])) {
        continue;
      }
      $mediaIds = array_keys($usageList['file']['media']);
      $mediaId = reset($mediaIds);
      $media = Media::load($mediaId);
      if (empty($media)) {
        continue;
      }
      // If we got here, we found a matching media item, so we can populate the
      // link metadata with its values and just break out of the wrappers loop.
      $link->setAttribute('href', '/media/' . $media->uuid() . '/edit');
      $link->setAttribute('data-id', $media->uuid());
      $link->setAttribute('data-entity-type', 'media');
      break;
    }
  }

}
