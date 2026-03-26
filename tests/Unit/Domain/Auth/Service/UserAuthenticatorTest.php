<?php

namespace Tests\Unit\Domain\Auth\Service;

use App\Domain\Auth\Entity\UserAuthEntity;
use App\Domain\Auth\Service\PasswordHasher;
use App\Domain\Auth\Service\UserAuthenticator;
use App\Domain\Auth\ValueObject\Email;
use PHPUnit\Framework\TestCase;

class UserAuthenticatorTest extends TestCase
{
    /**
     * 仕様:
     * PasswordHasher の検証結果が真なら、認証ユーザーは認証成功と判定される。
     */
    public function test_it_returns_true_when_password_matches(): void
    {
        $authenticator = new UserAuthenticator(new FixedPasswordHasher(true));
        $user = new UserAuthEntity(
            id: 1,
            userId: 2,
            email: Email::fromString('test@example.com'),
            passwordHash: 'hashed-password',
        );

        $this->assertTrue($authenticator->canAuthenticate($user, 'password'));
    }

    /**
     * 仕様:
     * PasswordHasher の検証結果が偽なら、認証ユーザーは認証失敗と判定される。
     */
    public function test_it_returns_false_when_password_does_not_match(): void
    {
        $authenticator = new UserAuthenticator(new FixedPasswordHasher(false));
        $user = new UserAuthEntity(
            id: 1,
            userId: 2,
            email: Email::fromString('test@example.com'),
            passwordHash: 'hashed-password',
        );

        $this->assertFalse($authenticator->canAuthenticate($user, 'wrong-password'));
    }
}

class FixedPasswordHasher implements PasswordHasher
{
    public function __construct(
        private readonly bool $result,
    ) {
    }

    public function check(string $plain, string $hashed): bool
    {
        return $this->result;
    }
}
