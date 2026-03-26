<?php

declare(strict_types=1);

namespace App\Application\ValuableBook\UseCase;

use App\Application\ValuableBook\Contract\CreateFavoriteGateway;
use App\Application\ValuableBook\Dto\CreateFavoriteInputData;

class CreateFavoriteUseCase
{
    public function __construct(
        private readonly CreateFavoriteGateway $createFavoriteGateway,
    ) {
    }

    public function __invoke(CreateFavoriteInputData $input): void
    {
        $this->createFavoriteGateway->store($input);
    }
}
