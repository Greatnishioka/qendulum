<?php

declare(strict_types=1);

namespace App\Domain\ValuableBook\Repository;

interface SearchArxivGateway
{
    /**
     * @return array<string, mixed>
     */
    public function search(string $query): array;
}
