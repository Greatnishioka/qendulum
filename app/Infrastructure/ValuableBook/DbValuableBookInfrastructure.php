<?php

declare(strict_types=1);

namespace App\Infrastructure\ValuableBook;

use App\Application\ValuableBook\Dto\CreateFavoriteInputData;
use App\Domain\ValuableBook\Repository\CreateFavoriteGateway;
use App\Models\User\User;
use App\Models\UserValuableBookFavorite;
use App\Models\ValuableBook\ValuableBook;
use Illuminate\Support\Facades\DB;

class DbValuableBookInfrastructure implements CreateFavoriteGateway
{
    public function store(CreateFavoriteInputData $input): void
    {
        $user = User::query()->where('public_uuid', $input->userPublicUuid)->firstOrFail();

        DB::transaction(function () use ($input, $user): void {
            $pdfUrl = $this->findLinkHref($input->valuableBook['links'] ?? [], 'related', 'application/pdf')
                ?? $this->findLinkHref($input->valuableBook['links'] ?? [], null, 'application/pdf');

            $absUrl = $this->findLinkHref($input->valuableBook['links'] ?? [], 'alternate', 'text/html')
                ?? (string) $input->valuableBook['id'];

            $valuableBook = ValuableBook::query()->firstOrCreate(
                [
                    'source' => 'arxiv',
                    'source_paper_id' => trim((string) $input->valuableBook['id']),
                ],
                [
                    'title' => trim((string) $input->valuableBook['title']),
                    'abstract' => $input->valuableBook['summary'] ?? null,
                    'published_at' => $input->valuableBook['published'] ?? null,
                    'updated_at_source' => $input->valuableBook['updated'] ?? null,
                    'pdf_url' => $pdfUrl,
                    'abs_url' => $absUrl,
                    'primary_category' => $input->valuableBook['primaryCategory']['term'] ?? null,
                    'categories' => collect($input->valuableBook['categories'] ?? [])
                        ->pluck('term')
                        ->values()
                        ->all(),
                    'authors' => collect($input->valuableBook['authors'] ?? [])
                        ->pluck('name')
                        ->values()
                        ->all(),
                    'raw_payload' => $input->valuableBook,
                ],
            );

            UserValuableBookFavorite::query()->firstOrCreate([
                'user_id' => $user->id,
                'valuable_book_id' => $valuableBook->id,
            ]);
        });
    }

    /**
     * @param array<int, array<string, mixed>> $links
     */
    private function findLinkHref(array $links, ?string $rel, ?string $type): ?string
    {
        foreach ($links as $link) {
            if ($rel !== null && ($link['rel'] ?? null) !== $rel) {
                continue;
            }

            if ($type !== null && ($link['type'] ?? null) !== $type) {
                continue;
            }

            $href = $link['href'] ?? null;

            if (is_string($href) && $href !== '') {
                return $href;
            }
        }

        return null;
    }
}
