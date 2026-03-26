<?php

namespace Tests\Unit\Application\Auth\UseCase;

use App\Application\Auth\Dto\LoginInputData;
use App\Application\Auth\UseCase\LoginUseCase;
use App\Domain\Auth\Entity\UserAuthEntity;
use App\Domain\Auth\Exception\InvalidCredentialsException;
use App\Domain\Auth\Repository\UserAuthRepository;
use App\Domain\Auth\Service\PasswordHasher;
use App\Domain\Auth\Service\UserAuthenticator;
use App\Domain\Auth\ValueObject\Email;
use App\Domain\Auth\ValueObject\Password;
use PHPUnit\Framework\TestCase;

class LoginUseCaseTest extends TestCase
{
    /**
     * 仕様:
     * メールアドレスに対応する認証ユーザーが存在し、パスワード検証が通る場合は
     * ログイン対象の認証ユーザーを返す。
     */
    public function test_it_returns_user_when_credentials_are_valid(): void
    {
        $user = new UserAuthEntity(
            id: 10,
            userId: 20,
            email: Email::fromString('test@example.com'),
            passwordHash: 'hashed-password',
        );

        $useCase = new LoginUseCase(
            new InMemoryUserAuthRepository($user),
            new UserAuthenticator(new FixedPasswordHasher(true)),
        );

        $resolved = $useCase->__invoke(new LoginInputData(
            email: Email::fromString('test@example.com'),
            password: Password::fromString('Strong@Pass'),
        ));

        $this->assertSame(10, $resolved->id());
        $this->assertSame('test@example.com', $resolved->email()->value());
    }

    /**
     * 仕様:
     * 認証ユーザーが存在しない場合、ログイン失敗例外を送出する。
     */
    public function test_it_throws_when_user_is_not_found(): void
    {
        $useCase = new LoginUseCase(
            new InMemoryUserAuthRepository(null),
            new UserAuthenticator(new FixedPasswordHasher(true)),
        );

        $this->expectException(InvalidCredentialsException::class);

        $useCase->__invoke(new LoginInputData(
            email: Email::fromString('missing@example.com'),
            password: Password::fromString('Strong@Pass'),
        ));
    }

    /**
     * 仕様:
     * 認証ユーザーが存在してもパスワード検証に失敗した場合、
     * ログイン失敗例外を送出する。
     */
    public function test_it_throws_when_password_is_invalid(): void
    {
        $user = new UserAuthEntity(
            id: 10,
            userId: 20,
            email: Email::fromString('test@example.com'),
            passwordHash: 'hashed-password',
        );

        $useCase = new LoginUseCase(
            new InMemoryUserAuthRepository($user),
            new UserAuthenticator(new FixedPasswordHasher(false)),
        );

        $this->expectException(InvalidCredentialsException::class);

        $useCase->__invoke(new LoginInputData(
            email: Email::fromString('test@example.com'),
            password: Password::fromString('Wrong@Pass'),
        ));
    }
}

class InMemoryUserAuthRepository implements UserAuthRepository
{
    public function __construct(
        private readonly ?UserAuthEntity $userAuth,
    ) {
    }

    public function findByEmail(Email $email): ?UserAuthEntity
    {
        if ($this->userAuth === null) {
            return null;
        }

        return $this->userAuth->email()->equals($email) ? $this->userAuth : null;
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
