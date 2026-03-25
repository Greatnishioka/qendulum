<?php

namespace App\Domain\Auth\Repository;

use App\Domain\Auth\Entity\UserAuthEntity;

interface UserAuthRepository
{
    public function findByEmail(string $email): ?UserAuthEntity;
}
