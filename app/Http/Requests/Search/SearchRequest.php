<?php

declare(strict_types=1);

namespace App\Http\Requests\Search;

use App\Application\Search\Dto\SearchInputData;
use Illuminate\Foundation\Http\FormRequest;

class SearchRequest extends FormRequest
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
            'query' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function toInputData(): SearchInputData
    {
        return new SearchInputData(
            query: trim((string) ($this->validated('query') ?? '')),
        );
    }
}
