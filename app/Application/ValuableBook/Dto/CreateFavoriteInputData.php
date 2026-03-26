<?php

declare(strict_types=1);

namespace App\Application\ValuableBook\Dto;

class CreateFavoriteInputData
{
    /**
     * @param array<string, mixed> $valuableBook
     */
    public function __construct(
        public readonly string $userPublicUuid,
        public readonly array $valuableBook,
    ) {
    }
}
