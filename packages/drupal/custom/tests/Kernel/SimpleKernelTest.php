<?php

namespace Drupal\Tests\custom\Kernel;

use Drupal\KernelTests\KernelTestBase;
use Drupal\user\Entity\User;

/**
 * Simple kernel test to verify kernel testing works.
 *
 * @group custom
 */
class SimpleKernelTest extends KernelTestBase {

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'system',
    'user',
  ];

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();
    $this->installEntitySchema('user');
  }

  /**
   * Tests creating a user and verifying its name.
   */
  public function testCreateUserAndVerifyName(): void {
    $user = User::create([
      'name' => 'testuser',
      'mail' => 'test@example.com',
    ]);
    $user->save();

    $this->assertEquals('testuser', $user->getAccountName());
  }

}
