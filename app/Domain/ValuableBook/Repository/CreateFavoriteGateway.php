<?php

declare(strict_types=1);

namespace App\Domain\ValuableBook\Repository;

use App\Application\ValuableBook\Dto\CreateFavoriteInputData;

interface CreateFavoriteGateway
{
    public function store(CreateFavoriteInputData $input): void;
}
