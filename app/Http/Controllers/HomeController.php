<?php

namespace App\Http\Controllers;

use App\Services\ArxivService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(Request $request, ArxivService $arxivService): Response
    {
        $validated = $request->validate([
            'query' => ['nullable', 'string', 'max:255'],
        ]);

        $query = trim((string) ($validated['query'] ?? ''));
        $feed = $query !== '' ? $arxivService->search($query) : null;

        return Inertia::render('Home', [
            'query' => $query,
            'feed' => $feed,
        ]);
    }
}
