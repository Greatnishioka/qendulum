<?php

declare(strict_types=1);

namespace App\Infrastructure\ValuableBook;

use App\Application\ValuableBook\Contract\SearchArxivGateway;
use DOMDocument;
use DOMElement;
use DOMXPath;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class ArxivSearchGateway implements SearchArxivGateway
{
    private const PACER_LOCK_KEY = 'arxiv:pacer-lock';
    private const LAST_REQUEST_AT_KEY = 'arxiv:last-request-at';

    /**
     * @return array<string, mixed>
     */
    public function search(string $query): array
    {
        $query = trim($query);
        $maxResults = (int) config('services.arxiv.default_max_results', 10);

        if ($query === '') {
            return $this->emptyFeed();
        }

        $cacheKey = sprintf(
            'arxiv:search:%s:%d:%d',
            sha1($query),
            0,
            $maxResults,
        );

        return Cache::remember(
            $cacheKey,
            now()->addSeconds((int) config('services.arxiv.cache_ttl_seconds', 600)),
            fn (): array => $this->fetchFeed($query, 0, $maxResults),
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function fetchFeed(string $query, int $start, int $maxResults): array
    {
        return Cache::lock(self::PACER_LOCK_KEY, 15)->block(15, function () use ($query, $start, $maxResults): array {
            $this->respectMinimumInterval();

            $response = Http::accept('application/atom+xml')
                ->timeout(15)
                ->get((string) config('services.arxiv.url'), [
                    'search_query' => 'all:'.$query,
                    'start' => $start,
                    'max_results' => $maxResults,
                ]);

            Cache::put(self::LAST_REQUEST_AT_KEY, microtime(true), now()->addHour());

            $response->throw();

            return $this->parseFeed($response->body());
        });
    }

    private function respectMinimumInterval(): void
    {
        $lastRequestAt = (float) Cache::get(self::LAST_REQUEST_AT_KEY, 0.0);
        $minimumInterval = (int) config('services.arxiv.min_interval_seconds', 3);
        $waitSeconds = ($lastRequestAt + $minimumInterval) - microtime(true);

        if ($waitSeconds > 0) {
            usleep((int) ($waitSeconds * 1000000));
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function parseFeed(string $xmlString): array
    {
        $document = new DOMDocument();
        $loaded = @$document->loadXML($xmlString);

        if (! $loaded) {
            throw new RuntimeException('Failed to parse arXiv XML response.');
        }

        $xpath = new DOMXPath($document);
        $xpath->registerNamespace('atom', 'http://www.w3.org/2005/Atom');
        $xpath->registerNamespace('opensearch', 'http://a9.com/-/spec/opensearch/1.1/');
        $xpath->registerNamespace('arxiv', 'http://arxiv.org/schemas/atom');

        $entries = [];

        foreach ($xpath->query('/atom:feed/atom:entry') ?: [] as $entryNode) {
            if (! $entryNode instanceof DOMElement) {
                continue;
            }

            $entries[] = [
                'id' => $this->nodeValue($xpath, './atom:id', $entryNode),
                'title' => $this->nodeValue($xpath, './atom:title', $entryNode),
                'summary' => $this->nodeValue($xpath, './atom:summary', $entryNode),
                'published' => $this->nodeValue($xpath, './atom:published', $entryNode),
                'updated' => $this->nodeValue($xpath, './atom:updated', $entryNode),
                'authors' => $this->mapAuthors($xpath, $entryNode),
                'links' => $this->mapLinks($xpath, $entryNode),
                'categories' => $this->mapCategories($xpath, $entryNode),
                'primaryCategory' => $this->mapPrimaryCategory($xpath, $entryNode),
                'comment' => $this->nullableNodeValue($xpath, './arxiv:comment', $entryNode),
                'journalRef' => $this->nullableNodeValue($xpath, './arxiv:journal_ref', $entryNode),
                'doi' => $this->nullableNodeValue($xpath, './arxiv:doi', $entryNode),
            ];
        }

        return [
            'id' => $this->nodeValue($xpath, '/atom:feed/atom:id'),
            'title' => $this->nodeValue($xpath, '/atom:feed/atom:title'),
            'updated' => $this->nodeValue($xpath, '/atom:feed/atom:updated'),
            'totalResults' => (int) $this->nodeValue($xpath, '/atom:feed/opensearch:totalResults'),
            'startIndex' => (int) $this->nodeValue($xpath, '/atom:feed/opensearch:startIndex'),
            'itemsPerPage' => (int) $this->nodeValue($xpath, '/atom:feed/opensearch:itemsPerPage'),
            'entries' => $entries,
        ];
    }

    /**
     * @return array<int, array{name:string}>
     */
    private function mapAuthors(DOMXPath $xpath, DOMElement $entryNode): array
    {
        $authors = [];

        foreach ($xpath->query('./atom:author', $entryNode) ?: [] as $authorNode) {
            if (! $authorNode instanceof DOMElement) {
                continue;
            }

            $authors[] = [
                'name' => $this->nodeValue($xpath, './atom:name', $authorNode),
            ];
        }

        return $authors;
    }

    /**
     * @return array<int, array{href:string,rel:?string,type:?string,title:?string}>
     */
    private function mapLinks(DOMXPath $xpath, DOMElement $entryNode): array
    {
        $links = [];

        foreach ($xpath->query('./atom:link', $entryNode) ?: [] as $linkNode) {
            if (! $linkNode instanceof DOMElement) {
                continue;
            }

            $links[] = [
                'href' => $linkNode->getAttribute('href'),
                'rel' => $this->nullableAttribute($linkNode, 'rel'),
                'type' => $this->nullableAttribute($linkNode, 'type'),
                'title' => $this->nullableAttribute($linkNode, 'title'),
            ];
        }

        return $links;
    }

    /**
     * @return array<int, array{term:string,scheme:?string}>
     */
    private function mapCategories(DOMXPath $xpath, DOMElement $entryNode): array
    {
        $categories = [];

        foreach ($xpath->query('./atom:category', $entryNode) ?: [] as $categoryNode) {
            if (! $categoryNode instanceof DOMElement) {
                continue;
            }

            $categories[] = [
                'term' => $categoryNode->getAttribute('term'),
                'scheme' => $this->nullableAttribute($categoryNode, 'scheme'),
            ];
        }

        return $categories;
    }

    /**
     * @return array{term:string,scheme:?string}|null
     */
    private function mapPrimaryCategory(DOMXPath $xpath, DOMElement $entryNode): ?array
    {
        $node = $xpath->query('./arxiv:primary_category', $entryNode)?->item(0);

        if (! $node instanceof DOMElement) {
            return null;
        }

        return [
            'term' => $node->getAttribute('term'),
            'scheme' => $this->nullableAttribute($node, 'scheme'),
        ];
    }

    private function nodeValue(DOMXPath $xpath, string $expression, ?DOMElement $contextNode = null): string
    {
        return trim($xpath->evaluate("string($expression)", $contextNode));
    }

    private function nullableNodeValue(DOMXPath $xpath, string $expression, ?DOMElement $contextNode = null): ?string
    {
        $value = $this->nodeValue($xpath, $expression, $contextNode);

        return $value !== '' ? $value : null;
    }

    private function nullableAttribute(DOMElement $element, string $attribute): ?string
    {
        $value = $element->getAttribute($attribute);

        return $value !== '' ? $value : null;
    }

    /**
     * @return array{id:string,title:string,updated:string,totalResults:int,startIndex:int,itemsPerPage:int,entries:array<int, mixed>}
     */
    private function emptyFeed(): array
    {
        return [
            'id' => '',
            'title' => '',
            'updated' => '',
            'totalResults' => 0,
            'startIndex' => 0,
            'itemsPerPage' => 0,
            'entries' => [],
        ];
    }
}
