<?php

namespace Drupal\silverback_search;

/**
 * Represents the result of fetching content from a remote frontend.
 */
class FetchResult {

  public function __construct(
    public ?string $content,
    public ?string $error,
    public ?string $remoteUrl,
    public ?int $statusCode,
    public bool $isSkipped = FALSE,
  ) {
    if (
      ($this->error === NULL && $this->content === NULL) ||
      ($this->error !== NULL && $this->content !== NULL)
    ) {
      throw new \Exception('Must provide either content or error');
    }
  }

}
