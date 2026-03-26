<?php

namespace App\Domain\Auth\Entity;

use App\Domain\Auth\ValueObject\Email;

class UserAuthEntity
{
    public function __construct(
        private readonly int $id,
        private readonly int $userId,
        private readonly Email $email,
        private readonly string $passwordHash,
    ) {
    }

    public function id(): int
    {
        return $this->id;
    }

    public function userId(): int
    {
        return $this->userId;
    }

    public function email(): Email
    {
        return $this->email;
    }

    public function passwordHash(): string
    {
        return $this->passwordHash;
    }
}
