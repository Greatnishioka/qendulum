<?php

declare(strict_types=1);

namespace App\Domain\User\ValueObject;

use InvalidArgumentException;

class UserPublicUuid
{
    private function __construct(
        private readonly string $value,
    ) {
    }

    public static function fromString(string $value): self
    {
        $trimmed = trim($value);

        if ($trimmed === '') {
            throw new InvalidArgumentException('User public UUID must not be empty.');
        }

        return new self($trimmed);
    }

    public function value(): string
    {
        return $this->value;
    }
}
