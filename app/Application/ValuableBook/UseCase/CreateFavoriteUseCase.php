<?php

declare(strict_types=1);

namespace App\Application\ValuableBook\UseCase;

use App\Application\ValuableBook\Dto\CreateFavoriteInputData;
use App\Domain\ValuableBook\Factory\ValuableBookFactory;
use App\Domain\ValuableBook\Repository\FavoriteRepository;
use App\Domain\ValuableBook\Repository\ValuableBookRepository;
use App\Domain\ValuableBook\ValueObject\UserPublicUuid;

class CreateFavoriteUseCase
{
    public function __construct(
        private readonly ValuableBookFactory $valuableBookFactory,
        private readonly ValuableBookRepository $valuableBookRepository,
        private readonly FavoriteRepository $favoriteRepository,
    ) {
    }

    public function __invoke(CreateFavoriteInputData $input): void
    {
        $valuableBook = $this->valuableBookFactory->create(
            source: $input->source,
            sourcePaperId: $input->sourcePaperId,
            title: $input->title,
            abstract: $input->abstract,
            publishedAt: $input->publishedAt,
            updatedAtSource: $input->updatedAtSource,
            authors: $input->authors,
            categories: $input->categories,
            links: $input->links,
            primaryCategory: $input->primaryCategory,
            rawPayload: $input->rawPayload,
        );

        $storedValuableBook = $this->valuableBookRepository->save($valuableBook);

        $this->favoriteRepository->store(
            UserPublicUuid::fromString($input->userPublicUuid),
            $storedValuableBook->identity(),
        );
    }
}
