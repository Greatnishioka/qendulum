<?php

declare(strict_types=1);

namespace App\Application\ValuableBook\UseCase;

use App\Application\ValuableBook\Dto\SearchArxivInputData;
use App\Domain\ValuableBook\Repository\SearchArxivGateway;

class SearchArxivUseCase
{
    public function __construct(
        private readonly SearchArxivGateway $searchArxivGateway,
    ) {
    }

    /**
     * @return array<string, mixed>|null
     */
    public function __invoke(SearchArxivInputData $input): ?array
    {
        if (! $input->hasQuery()) {
            return null;
        }

        return $this->searchArxivGateway->search($input->query);
    }
}
