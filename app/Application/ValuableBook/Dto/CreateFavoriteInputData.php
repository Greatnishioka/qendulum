<?php

declare(strict_types=1);

namespace App\Application\ValuableBook\Dto;

class CreateFavoriteInputData
{
    /**
     * @param list<string> $authors
     * @param list<string> $categories
     * @param array<string, mixed> $rawPayload
     */
    public function __construct(
        public readonly string $userPublicUuid,
        public readonly string $source,
        public readonly string $sourcePaperId,
        public readonly string $title,
        public readonly ?string $abstract,
        public readonly ?string $publishedAt,
        public readonly ?string $updatedAtSource,
        public readonly ?string $pdfUrl,
        public readonly ?string $absUrl,
        public readonly ?string $primaryCategory,
        public readonly array $authors,
        public readonly array $categories,
        public readonly array $rawPayload,
    ) {
    }
}
