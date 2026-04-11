<?php

declare(strict_types=1);

namespace App\Application\ValuableBook\UseCase;

use App\Application\Shared\Transaction\TransactionManager;
use App\Application\ValuableBook\Dto\CreateFavoriteInputData;
use App\Application\ValuableBook\Port\FavoriteStore;
use App\Application\ValuableBook\Port\UserIdResolver;
use App\Domain\ValuableBook\Factory\ValuableBookFactory;
use App\Domain\ValuableBook\Repository\ValuableBookRepository;
use App\Domain\User\ValueObject\UserPublicUuid;

class CreateFavoriteUseCase
{
    public function __construct(
        private readonly ValuableBookFactory $valuableBookFactory,
        private readonly ValuableBookRepository $valuableBookRepository,
        private readonly UserIdResolver $userIdResolver,
        private readonly FavoriteStore $favoriteStore,
        private readonly TransactionManager $transactionManager,
    ) {
    }

    public function __invoke(CreateFavoriteInputData $input): void
    {
        $this->transactionManager->run(function () use ($input): void {
            $userId = $this->userIdResolver->resolve(
                UserPublicUuid::fromString($input->userPublicUuid),
            );

            $valuableBook = $this->valuableBookFactory->create(
                source: $input->source,
                sourcePaperId: $input->sourcePaperId,
                title: $input->title,
                abstract: $input->abstract,
                publishedAt: $input->publishedAt,
                updatedAtSource: $input->updatedAtSource,
                pdfUrl: $input->pdfUrl,
                absUrl: $input->absUrl,
                primaryCategory: $input->primaryCategory,
                authors: $input->authors,
                categories: $input->categories,
                rawPayload: $input->rawPayload,
            );

            $storedValuableBook = $this->valuableBookRepository->upsert($valuableBook);

            $this->favoriteStore->store($userId, $storedValuableBook->identity());
        });
    }
}
