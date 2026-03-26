<?php

declare(strict_types=1);

namespace App\Http\Responders\ValuableBook;

use Illuminate\Contracts\Support\Arrayable;
use Inertia\Inertia;
use Inertia\Response;

class SearchArxivResponder
{
    /**
     * @param array<string, mixed>|Arrayable<string, mixed>|null $feed
     */
    public function success(array|Arrayable|null $feed): Response
    {
        return Inertia::render('Home', [
            'feed' => $feed,
        ]);
    }
}
