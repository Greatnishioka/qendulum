<?php

declare(strict_types=1);

namespace App\Application\ValuableBook\Dto;

class CreateFavoriteInputData
{
    /**
     * @param array<int, array{name:string}> $authors
     * @param array<int, array{term:string,scheme:?string}> $categories
     * @param array<int, array{href:string,rel:?string,type:?string,title:?string}> $links
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
        public readonly array $authors,
        public readonly array $categories,
        public readonly array $links,
        public readonly ?string $primaryCategory,
        public readonly array $rawPayload,
    ) {
    }
}
