<?php

namespace App\Domain\Auth\Entity;

class UserAuthEntity
{
    public function __construct(
        private readonly int $id,
        private readonly int $userId,
        private readonly string $email,
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

    public function email(): string
    {
        return $this->email;
    }

    public function passwordHash(): string
    {
        return $this->passwordHash;
    }
}
