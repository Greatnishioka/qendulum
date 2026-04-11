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
     * @param list<string> $authors
     * @param list<string> $categories
     * @param array<string, mixed> $rawPayload
     */
    public function create(
        string $source,
        string $sourcePaperId,
        string $title,
        ?string $abstract,
        ?string $publishedAt,
        ?string $updatedAtSource,
        ?string $pdfUrl,
        ?string $absUrl,
        ?string $primaryCategory,
        array $authors,
        array $categories,
        array $rawPayload,
    ): ValuableBookEntity {
        return new ValuableBookEntity(
            source: ValuableBookSource::fromString($source),
            sourcePaperId: SourcePaperId::fromString($sourcePaperId),
            title: ValuableBookTitle::fromString($title),
            abstract: $abstract,
            publishedAt: $this->dateTimeOrNull($publishedAt),
            updatedAtSource: $this->dateTimeOrNull($updatedAtSource),
            pdfUrl: $this->stringOrNull($pdfUrl),
            absUrl: $this->stringOrNull($absUrl) ?? trim($sourcePaperId),
            primaryCategory: $primaryCategory,
            categories: $this->normalizeStrings($categories),
            authors: $this->normalizeStrings($authors),
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

    private function stringOrNull(?string $value): ?string
    {
        $trimmed = $value !== null ? trim($value) : null;

        return $trimmed !== null && $trimmed !== '' ? $trimmed : null;
    }

    /**
     * @param list<string> $values
     * @return list<string>
     */
    private function normalizeStrings(array $values): array
    {
        return array_values(array_filter(array_map(
            static fn (string $value): string => trim($value),
            $values,
        ), static fn (string $value): bool => $value !== ''));
    }
}
