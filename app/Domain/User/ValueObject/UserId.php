<?php

declare(strict_types=1);

namespace App\Domain\User\ValueObject;

use InvalidArgumentException;

class UserId
{
    private function __construct(
        private readonly int $value,
    ) {
    }

    public static function fromInt(int $value): self
    {
        if ($value < 1) {
            throw new InvalidArgumentException('User ID must be greater than zero.');
        }

        return new self($value);
    }

    public function value(): int
    {
        return $this->value;
    }
}
