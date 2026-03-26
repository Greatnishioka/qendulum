<?php

namespace App\Domain\Auth\ValueObject;

use InvalidArgumentException;

class Email
{
    private function __construct(
        private readonly string $value,
    ) {
    }

    public static function fromString(string $value): self
    {
        if (filter_var($value, FILTER_VALIDATE_EMAIL) === false) {
            throw new InvalidArgumentException('Invalid email address.');
        }

        return new self($value);
    }

    public function value(): string
    {
        return $this->value;
    }

    public function equals(self $other): bool
    {
        return $this->value === $other->value;
    }

    public function __toString(): string
    {
        return $this->value;
    }
}
