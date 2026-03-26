<?php

namespace Tests\Unit\Domain\Auth\ValueObject;

use App\Domain\Auth\ValueObject\Email;
use InvalidArgumentException;
use PHPUnit\Framework\TestCase;

class EmailTest extends TestCase
{
    /**
     * 仕様:
     * メールアドレス文字列から Email 値オブジェクトを生成できる。
     */
    public function test_it_creates_email_value_object_from_valid_string(): void
    {
        $email = Email::fromString('test@example.com');

        $this->assertSame('test@example.com', $email->value());
        $this->assertSame('test@example.com', (string) $email);
    }

    /**
     * 仕様:
     * メールアドレス形式でない文字列は Email 値オブジェクトとして受け付けない。
     */
    public function test_it_rejects_invalid_email_string(): void
    {
        $this->expectException(InvalidArgumentException::class);

        Email::fromString('not-an-email');
    }
}
