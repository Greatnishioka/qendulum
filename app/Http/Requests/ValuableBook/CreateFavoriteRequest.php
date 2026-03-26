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

        return new CreateFavoriteInputData(
            userPublicUuid: trim((string) $this->validated('user_id')),
            valuableBook: $valuableBook,
        );
    }
}
