<?php

declare(strict_types=1);

namespace App\Application\ValuableBook\Contract;

interface SearchArxivGateway
{
    /**
     * @return array<string, mixed>
     */
    public function search(string $query): array;
}
