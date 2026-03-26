<?php

declare(strict_types=1);

namespace App\Application\ValuableBook\Dto;

class SearchArxivInputData
{
    public function __construct(
        public readonly string $query,
    ) {
    }

    public function hasQuery(): bool
    {
        return $this->query !== '';
    }
}
