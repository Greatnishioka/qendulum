<?php

namespace App\Domain\Auth\Service;

use App\Domain\Auth\Entity\UserAuthEntity;

class UserAuthenticator
{
    public function __construct(
        private readonly PasswordHasher $passwordHasher,
    ) {
    }

    public function canAuthenticate(UserAuthEntity $userAuth, string $plainPassword): bool
    {
        return $this->passwordHasher->check($plainPassword, $userAuth->passwordHash());
    }
}
