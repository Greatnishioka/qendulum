<?php

declare(strict_types=1);

namespace App\Domain\ValuableBook\ValueObject;

use InvalidArgumentException;

class SourcePaperId
{
    private function __construct(
        private readonly string $value,
    ) {
    }

    public static function fromString(string $value): self
    {
        $trimmed = trim($value);

        if ($trimmed === '') {
            throw new InvalidArgumentException('Source paper id must not be empty.');
        }

        return new self($trimmed);
    }

    public function value(): string
    {
        return $this->value;
    }
}
