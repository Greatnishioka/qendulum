<?php

declare(strict_types=1);

namespace App\Http\Requests\ValuableBook;

use App\Application\ValuableBook\Dto\SearchArxivInputData;
use Illuminate\Foundation\Http\FormRequest;

class SearchArxivRequest extends FormRequest
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

    public function toInputData(): SearchArxivInputData
    {
        return new SearchArxivInputData(
            query: trim((string) ($this->validated('query') ?? '')),
        );
    }
}
