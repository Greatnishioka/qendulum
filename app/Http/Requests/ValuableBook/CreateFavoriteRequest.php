<?php

declare(strict_types=1);

namespace App\Http\Requests\ValuableBook;

use App\Application\ValuableBook\Dto\CreateFavoriteInputData;
use Illuminate\Foundation\Http\FormRequest;

class CreateFavoriteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'user_id' => ['required', 'string', 'max:255'],
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
        ];
    }

    public function toInputData(): CreateFavoriteInputData
    {
        /** @var array<string, mixed> $valuableBook */
        $valuableBook = $this->validated('valuable_book');
        /** @var array{term?:string,scheme?:?string}|null $primaryCategory */
        $primaryCategory = $valuableBook['primaryCategory'] ?? null;
        /** @var array<int, array{name:string}> $authors */
        $authors = $valuableBook['authors'] ?? [];
        /** @var array<int, array{term:string,scheme:?string}> $categories */
        $categories = $valuableBook['categories'] ?? [];
        /** @var array<int, array{href:string,rel:?string,type:?string,title:?string}> $links */
        $links = $valuableBook['links'] ?? [];

        return new CreateFavoriteInputData(
            userPublicUuid: trim((string) $this->validated('user_id')),
            source: 'arxiv',
            sourcePaperId: trim((string) $valuableBook['id']),
            title: trim((string) $valuableBook['title']),
            abstract: isset($valuableBook['summary']) ? (string) $valuableBook['summary'] : null,
            publishedAt: isset($valuableBook['published']) ? (string) $valuableBook['published'] : null,
            updatedAtSource: isset($valuableBook['updated']) ? (string) $valuableBook['updated'] : null,
            pdfUrl: $this->findLinkHref($links, 'related', 'application/pdf')
                ?? $this->findLinkHref($links, null, 'application/pdf'),
            absUrl: $this->findLinkHref($links, 'alternate', 'text/html')
                ?? trim((string) $valuableBook['id']),
            primaryCategory: isset($primaryCategory['term']) ? (string) $primaryCategory['term'] : null,
            authors: array_values(array_map(
                static fn (array $author): string => trim((string) $author['name']),
                $authors,
            )),
            categories: array_values(array_map(
                static fn (array $category): string => trim((string) $category['term']),
                $categories,
            )),
            rawPayload: $valuableBook,
        );
    }

    /**
     * @param array<int, array{href:string,rel:?string,type:?string,title:?string}> $links
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

            $href = trim((string) $link['href']);

            if ($href !== '') {
                return $href;
            }
        }

        return null;
    }
}
