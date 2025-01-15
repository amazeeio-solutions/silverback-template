<?php

declare(strict_types=1);

namespace Drupal\Tests\silverback_ai_test\Kernel;

use Drupal\KernelTests\KernelTestBase;

/**
 * Test description.
 *
 * @group silverback_ai_test
 */
final class BaseKernelTest extends KernelTestBase {

  /**
   * {@inheritdoc}
   */
  protected static $modules = ['silverback_ai_test'];

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();
    // Mock necessary services here.
  }

  /**
   * Test callback.
   */
  public function testSomething(): void {
    self::assertTrue(TRUE);
  }

}
