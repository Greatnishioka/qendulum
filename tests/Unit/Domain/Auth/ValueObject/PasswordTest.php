<?php

namespace Tests\Unit\Domain\Auth\ValueObject;

use App\Domain\Auth\ValueObject\Password;
use InvalidArgumentException;
use PHPUnit\Framework\TestCase;

class PasswordTest extends TestCase
{
    /**
     * 仕様:
     * 大文字小文字と特殊文字を含む 8 文字以上 128 文字以下の文字列から Password 値オブジェクトを生成できる。
     */
    public function test_it_creates_password_value_object_from_valid_string(): void
    {
        $password = Password::fromString('Strong@Pass');

        $this->assertSame('Strong@Pass', $password->value());
        $this->assertSame('Strong@Pass', (string) $password);
    }

    /**
     * 仕様:
     * 8 文字未満の文字列は Password 値オブジェクトとして受け付けない。
     */
    public function test_it_rejects_too_short_password(): void
    {
        $this->expectException(InvalidArgumentException::class);

        Password::fromString('Aa@1234');
    }

    /**
     * 仕様:
     * 大文字小文字が混在しない文字列は Password 値オブジェクトとして受け付けない。
     */
    public function test_it_rejects_password_without_mixed_case(): void
    {
        $this->expectException(InvalidArgumentException::class);

        Password::fromString('lowercase@only');
    }

    /**
     * 仕様:
     * 特殊文字を含まない文字列は Password 値オブジェクトとして受け付けない。
     */
    public function test_it_rejects_password_without_special_character(): void
    {
        $this->expectException(InvalidArgumentException::class);

        Password::fromString('StrongPass');
    }
}
