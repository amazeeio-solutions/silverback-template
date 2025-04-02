<?php

declare(strict_types=1);

namespace Drupal\custom;

use Drupal\Core\Datetime\DateFormatterInterface;
use Drupal\Core\Session\AccountProxyInterface;

final class User {

  /**
   * Constructs a User object.
   */
  public function __construct(
    private readonly AccountProxyInterface $currentUser,
    private readonly DateFormatterInterface $dateFormatter,
  ) {}

  /**
   * Wrapper of current user data to be used for the OAuth demo.
   */
  public function currentUser(): array|null {
    if ($this->currentUser->isAnonymous()) {
      return NULL;
    }
    else {
      $user = \Drupal\user\Entity\User::load($this->currentUser->id());
      $memberFor = $this->dateFormatter->formatTimeDiffSince($user->getCreatedTime());
      return [
        'id' => $this->currentUser->id(),
        'name' => $this->currentUser->getDisplayName(),
        'email' => $this->currentUser->getEmail(),
        'memberFor' => $memberFor,
      ];
    }
  }

}
