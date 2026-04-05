<?php

declare(strict_types=1);

namespace App\Domain\ValuableBook\Factory;

use App\Domain\ValuableBook\Entity\ValuableBookEntity;
use App\Domain\ValuableBook\ValueObject\SourcePaperId;
use App\Domain\ValuableBook\ValueObject\ValuableBookSource;
use App\Domain\ValuableBook\ValueObject\ValuableBookTitle;
use DateTimeImmutable;

class ValuableBookFactory
{
    /**
     * @param array<int, array{name:string}> $authors
     * @param array<int, array{term:string,scheme:?string}> $categories
     * @param array<int, array{href:string,rel:?string,type:?string,title:?string}> $links
     * @param array<string, mixed> $rawPayload
     */
    public function create(
        string $source,
        string $sourcePaperId,
        string $title,
        ?string $abstract,
        ?string $publishedAt,
        ?string $updatedAtSource,
        array $authors,
        array $categories,
        array $links,
        ?string $primaryCategory,
        array $rawPayload,
    ): ValuableBookEntity {
        return new ValuableBookEntity(
            source: ValuableBookSource::fromString($source),
            sourcePaperId: SourcePaperId::fromString($sourcePaperId),
            title: ValuableBookTitle::fromString($title),
            abstract: $abstract,
            publishedAt: $this->dateTimeOrNull($publishedAt),
            updatedAtSource: $this->dateTimeOrNull($updatedAtSource),
            pdfUrl: $this->findLinkHref($links, 'related', 'application/pdf')
                ?? $this->findLinkHref($links, null, 'application/pdf'),
            absUrl: $this->findLinkHref($links, 'alternate', 'text/html')
                ?? trim($sourcePaperId),
            primaryCategory: $primaryCategory,
            categories: array_values(array_map(
                static fn (array $category): string => trim($category['term']),
                $categories,
            )),
            authors: array_values(array_map(
                static fn (array $author): string => trim($author['name']),
                $authors,
            )),
            rawPayload: $rawPayload,
        );
    }

    private function dateTimeOrNull(?string $value): ?DateTimeImmutable
    {
        if ($value === null || trim($value) === '') {
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

            $href = trim($link['href']);

            if ($href !== '') {
                return $href;
            }
        }

        return null;
    }
}
