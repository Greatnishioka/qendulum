<?php

declare(strict_types=1);

namespace App\Application\ValuableBook\Contract;

use App\Application\ValuableBook\Dto\CreateFavoriteInputData;

interface CreateFavoriteGateway
{
    public function store(CreateFavoriteInputData $input): void;
}
