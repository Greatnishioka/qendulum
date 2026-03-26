<?php

namespace App\Domain\Auth\ValueObject;

use InvalidArgumentException;

class Password
{
    private function __construct(
        private readonly string $value,
    ) {
    }

    public static function fromString(string $value): self
    {
        $length = mb_strlen($value);

        if ($length < 8 || $length > 128) {
            throw new InvalidArgumentException('Password must be between 8 and 128 characters.');
        }

        if (! preg_match('/[A-Z]/', $value) || ! preg_match('/[a-z]/', $value)) {
            throw new InvalidArgumentException('Password must include both uppercase and lowercase letters.');
        }

        if (! preg_match('/[^a-zA-Z0-9]/', $value)) {
            throw new InvalidArgumentException('Password must include at least one special character.');
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
