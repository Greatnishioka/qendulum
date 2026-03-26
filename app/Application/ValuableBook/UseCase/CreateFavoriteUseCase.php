<?php

declare(strict_types=1);

namespace App\Application\ValuableBook\UseCase;

use App\Application\ValuableBook\Dto\CreateFavoriteInputData;
use App\Domain\ValuableBook\Entity\ValuableBookEntity;
use App\Domain\ValuableBook\Repository\FavoriteRepository;
use App\Domain\ValuableBook\Repository\ValuableBookRepository;
use App\Domain\ValuableBook\ValueObject\SourcePaperId;
use App\Domain\ValuableBook\ValueObject\UserPublicUuid;
use App\Domain\ValuableBook\ValueObject\ValuableBookSource;
use App\Domain\ValuableBook\ValueObject\ValuableBookTitle;
use DateTimeImmutable;

class CreateFavoriteUseCase
{
    public function __construct(
        private readonly ValuableBookRepository $valuableBookRepository,
        private readonly FavoriteRepository $favoriteRepository,
    ) {
    }

    public function __invoke(CreateFavoriteInputData $input): void
    {
        $valuableBook = new ValuableBookEntity(
            source: ValuableBookSource::fromString($input->source),
            sourcePaperId: SourcePaperId::fromString($input->sourcePaperId),
            title: ValuableBookTitle::fromString($input->title),
            abstract: $input->abstract,
            publishedAt: $this->dateTimeOrNull($input->publishedAt),
            updatedAtSource: $this->dateTimeOrNull($input->updatedAtSource),
            pdfUrl: $this->findLinkHref($input->links, 'related', 'application/pdf')
                ?? $this->findLinkHref($input->links, null, 'application/pdf'),
            absUrl: $this->findLinkHref($input->links, 'alternate', 'text/html')
                ?? $input->sourcePaperId,
            primaryCategory: $input->primaryCategory,
            categories: array_values(array_map(
                static fn (array $category): string => $category['term'],
                $input->categories,
            )),
            authors: array_values(array_map(
                static fn (array $author): string => $author['name'],
                $input->authors,
            )),
            rawPayload: $input->rawPayload,
        );

        $storedValuableBook = $this->valuableBookRepository->save($valuableBook);

        $this->favoriteRepository->store(
            UserPublicUuid::fromString($input->userPublicUuid),
            $storedValuableBook,
        );
    }

    private function dateTimeOrNull(?string $value): ?DateTimeImmutable
    {
        if ($value === null || $value === '') {
            return null;
        }

        return new DateTimeImmutable($value);
    }

    /**
     * @param array<int, array{href:string,rel:?string,type:?string,title:?string}> $links
     */
    private function findLinkHref(array $links, ?string $rel, ?string $type): ?string
    {
        foreach ($links as $link) {
            if ($rel !== null && $link['rel'] !== $rel) {
                continue;
            }

            if ($type !== null && $link['type'] !== $type) {
                continue;
            }

            if ($link['href'] !== '') {
                return $link['href'];
            }
        }

        return null;
    }
}
