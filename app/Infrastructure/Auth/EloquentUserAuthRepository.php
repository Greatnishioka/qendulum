<?php

namespace App\Infrastructure\Auth;

use App\Domain\Auth\Entity\UserAuthEntity;
use App\Domain\Auth\Repository\UserAuthRepository;
use App\Domain\Auth\ValueObject\Email;
use App\Models\User\UserAuth;

class EloquentUserAuthRepository implements UserAuthRepository
{
    public function findByEmail(Email $email): ?UserAuthEntity
    {
        $userAuth = UserAuth::query()->where('email', $email->value())->first();

        if ($userAuth === null) {
            return null;
        }

        return new UserAuthEntity(
            id: (int) $userAuth->id,
            userId: (int) $userAuth->user_id,
            email: Email::fromString((string) $userAuth->email),
            passwordHash: (string) $userAuth->password,
        );
    }
}
