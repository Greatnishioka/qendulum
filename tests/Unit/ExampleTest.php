<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class ExampleTest extends TestCase
{
    /**
     * 仕様:
     * PHPUnit の実行基盤が正常に動作していることを確認する。
     */
    public function test_that_true_is_true(): void
    {
        $this->assertTrue(true);
    }
}
