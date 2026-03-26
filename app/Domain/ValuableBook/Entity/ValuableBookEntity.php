<?php

declare(strict_types=1);

namespace App\Domain\ValuableBook\Entity;

use App\Domain\ValuableBook\ValueObject\SourcePaperId;
use App\Domain\ValuableBook\ValueObject\ValuableBookSource;
use App\Domain\ValuableBook\ValueObject\ValuableBookTitle;
use DateTimeImmutable;

class ValuableBookEntity
{
    /**
     * @param array<int, string> $categories
     * @param array<int, string> $authors
     * @param array<string, mixed> $rawPayload
     */
    public function __construct(
        private readonly ValuableBookSource $source,
        private readonly SourcePaperId $sourcePaperId,
        private readonly ValuableBookTitle $title,
        private readonly ?string $abstract = null,
        private readonly ?DateTimeImmutable $publishedAt = null,
        private readonly ?DateTimeImmutable $updatedAtSource = null,
        private readonly ?string $pdfUrl = null,
        private readonly ?string $absUrl = null,
        private readonly ?string $primaryCategory = null,
        private readonly array $categories = [],
        private readonly array $authors = [],
        private readonly array $rawPayload = [],
        private readonly ?int $id = null,
    ) {
    }

    public function id(): ?int
    {
        return $this->id;
    }

    public function source(): ValuableBookSource
    {
        return $this->source;
    }

    public function sourcePaperId(): SourcePaperId
    {
        return $this->sourcePaperId;
    }

    public function title(): ValuableBookTitle
    {
        return $this->title;
    }

    public function abstract(): ?string
    {
        return $this->abstract;
    }

    public function publishedAt(): ?DateTimeImmutable
    {
        return $this->publishedAt;
    }

    public function updatedAtSource(): ?DateTimeImmutable
    {
        return $this->updatedAtSource;
    }

    public function pdfUrl(): ?string
    {
        return $this->pdfUrl;
    }

    public function absUrl(): ?string
    {
        return $this->absUrl;
    }

    public function primaryCategory(): ?string
    {
        return $this->primaryCategory;
    }

    /**
     * @return array<int, string>
     */
    public function categories(): array
    {
        return $this->categories;
    }

    /**
     * @return array<int, string>
     */
    public function authors(): array
    {
        return $this->authors;
    }

    /**
     * @return array<string, mixed>
     */
    public function rawPayload(): array
    {
        return $this->rawPayload;
    }

    public function withId(int $id): self
    {
        return new self(
            source: $this->source,
            sourcePaperId: $this->sourcePaperId,
            title: $this->title,
            abstract: $this->abstract,
            publishedAt: $this->publishedAt,
            updatedAtSource: $this->updatedAtSource,
            pdfUrl: $this->pdfUrl,
            absUrl: $this->absUrl,
            primaryCategory: $this->primaryCategory,
            categories: $this->categories,
            authors: $this->authors,
            rawPayload: $this->rawPayload,
            id: $id,
        );
    }
}
