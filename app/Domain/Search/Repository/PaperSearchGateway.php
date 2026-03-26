<?php

declare(strict_types=1);

namespace App\Domain\Search\Repository;

interface PaperSearchGateway
{
    /**
     * @return array<string, mixed>
     */
    public function search(string $query): array;
}
