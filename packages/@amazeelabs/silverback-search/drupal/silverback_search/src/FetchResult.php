<?php

namespace Drupal\silverback_search;

class FetchResult {

  public function __construct(
    public ?string $content,
    public ?string $error,
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
