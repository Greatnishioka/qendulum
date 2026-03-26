<?php

declare(strict_types=1);

namespace App\Application\Search\UseCase;

use App\Application\Search\Dto\SearchInputData;
use App\Domain\Search\Repository\PaperSearchGateway;

class SearchPaperUseCase
{
    public function __construct(
        private readonly PaperSearchGateway $paperSearchGateway,
    ) {
    }

    /**
     * @return array<string, mixed>|null
     */
    public function __invoke(SearchInputData $input): ?array
    {
        if (! $input->hasQuery()) {
            return null;
        }

        return $this->paperSearchGateway->search($input->query);
    }
}
