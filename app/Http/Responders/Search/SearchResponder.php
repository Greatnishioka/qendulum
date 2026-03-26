<?php

declare(strict_types=1);

namespace App\Http\Responders\Search;

use Illuminate\Contracts\Support\Arrayable;
use Inertia\Inertia;
use Inertia\Response;

class SearchResponder
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
