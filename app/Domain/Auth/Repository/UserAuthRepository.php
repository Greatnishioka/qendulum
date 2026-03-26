<?php

namespace App\Domain\Auth\Repository;

use App\Domain\Auth\Entity\UserAuthEntity;
use App\Domain\Auth\ValueObject\Email;

interface UserAuthRepository
{
    public function findByEmail(Email $email): ?UserAuthEntity;
}
