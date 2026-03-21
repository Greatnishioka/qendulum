<?php
declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

// models
use App\Models\UserValuableBookFavorite;
use App\Models\User\User;
use App\Models\ValuableBook\ValuableBook;

class FavoriteController extends Controller
{
    public function __invoke(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'string', 'max:255'], // public_uuid
            'valuable_book' => ['required', 'array'],
            'valuable_book.id' => ['required', 'string', 'max:255'],
            'valuable_book.title' => ['required', 'string', 'max:255'],
            'valuable_book.summary' => ['nullable', 'string'],
            'valuable_book.published' => ['nullable', 'date'],
            'valuable_book.updated' => ['nullable', 'date'],
            'valuable_book.authors' => ['nullable', 'array'],
            'valuable_book.authors.*.name' => ['required_with:valuable_book.authors', 'string', 'max:255'],
            'valuable_book.links' => ['nullable', 'array'],
            'valuable_book.links.*.href' => ['required_with:valuable_book.links', 'string', 'max:2048'],
            'valuable_book.links.*.rel' => ['nullable', 'string', 'max:255'],
            'valuable_book.links.*.type' => ['nullable', 'string', 'max:255'],
            'valuable_book.links.*.title' => ['nullable', 'string', 'max:255'],
            'valuable_book.categories' => ['nullable', 'array'],
            'valuable_book.categories.*.term' => ['required_with:valuable_book.categories', 'string', 'max:255'],
            'valuable_book.categories.*.scheme' => ['nullable', 'string', 'max:255'],
            'valuable_book.primaryCategory' => ['nullable', 'array'],
            'valuable_book.primaryCategory.term' => ['nullable', 'string', 'max:255'],
            'valuable_book.primaryCategory.scheme' => ['nullable', 'string', 'max:255'],
            'valuable_book.comment' => ['nullable', 'string'],
            'valuable_book.journalRef' => ['nullable', 'string', 'max:255'],
            'valuable_book.doi' => ['nullable', 'string', 'max:255'],
        ]);

        $user = User::where('public_uuid', trim((string) $validated['user_id']))->firstOrFail();
        $valuableBookPayload = $validated['valuable_book'];

        DB::transaction(function () use ($user, $valuableBookPayload): void {
            $pdfUrl = $this->findLinkHref($valuableBookPayload['links'] ?? [], 'related', 'application/pdf')
                ?? $this->findLinkHref($valuableBookPayload['links'] ?? [], null, 'application/pdf');

            $absUrl = $this->findLinkHref($valuableBookPayload['links'] ?? [], 'alternate', 'text/html')
                ?? $valuableBookPayload['id'];

            $valuableBook = ValuableBook::firstOrCreate(
                [
                    'source' => 'arxiv',
                    'source_paper_id' => trim((string) $valuableBookPayload['id']),
                ],
                [
                    'title' => trim((string) $valuableBookPayload['title']),
                    'abstract' => $valuableBookPayload['summary'] ?? null,
                    'published_at' => $valuableBookPayload['published'] ?? null,
                    'updated_at_source' => $valuableBookPayload['updated'] ?? null,
                    'pdf_url' => $pdfUrl,
                    'abs_url' => $absUrl,
                    'primary_category' => $valuableBookPayload['primaryCategory']['term'] ?? null,
                    'categories' => collect($valuableBookPayload['categories'] ?? [])
                        ->pluck('term')
                        ->values()
                        ->all(),
                    'authors' => collect($valuableBookPayload['authors'] ?? [])
                        ->pluck('name')
                        ->values()
                        ->all(),
                    'raw_payload' => $valuableBookPayload,
                ],
            );

            UserValuableBookFavorite::firstOrCreate([
                'user_id' => $user->id,
                'valuable_book_id' => $valuableBook->id,
            ]);
        });

        return redirect()->back();
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
