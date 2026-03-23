<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class HomeSearchTest extends TestCase
{
    /**
     * 仕様:
     * 検索クエリ未指定で検索画面を開いた場合、外部 API は呼び出さず、
     * Home コンポーネントには feed=null を渡す。
     */
    public function test_search_without_query_returns_home_with_null_feed(): void
    {
        Http::preventStrayRequests();

        $response = $this->get(route('api.search'));

        $response
            ->assertOk()
            ->assertInertia(fn(Assert $page) => $page
                ->component('Home')
                ->where('feed', null));
    }

    /**
     * 仕様:
     * 検索クエリ指定時は arXiv API の Atom フィードを解釈し、
     * 画面に返す feed に論文情報を整形して格納する。
     */
    public function test_search_with_query_returns_parsed_arxiv_feed(): void
    {
        Http::fake([
            'export.arxiv.org/*' => Http::response(<<<'XML'
<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom"
      xmlns:opensearch="http://a9.com/-/spec/opensearch/1.1/"
      xmlns:arxiv="http://arxiv.org/schemas/atom">
  <id>http://arxiv.org/api/x1</id>
  <title>ArXiv Query: all:quantum</title>
  <updated>2026-03-23T00:00:00Z</updated>
  <opensearch:totalResults>1</opensearch:totalResults>
  <opensearch:startIndex>0</opensearch:startIndex>
  <opensearch:itemsPerPage>10</opensearch:itemsPerPage>
  <entry>
    <id>http://arxiv.org/abs/1234.5678v1</id>
    <updated>2026-03-22T00:00:00Z</updated>
    <published>2026-03-21T00:00:00Z</published>
    <title>Quantum Paper</title>
    <summary>Important summary.</summary>
    <author>
      <name>Alice</name>
    </author>
    <author>
      <name>Bob</name>
    </author>
    <link href="http://arxiv.org/abs/1234.5678v1" rel="alternate" type="text/html" />
    <link href="http://arxiv.org/pdf/1234.5678v1" rel="related" type="application/pdf" />
    <category term="quant-ph" scheme="http://arxiv.org/schemas/atom" />
    <category term="cs.AI" scheme="http://arxiv.org/schemas/atom" />
    <arxiv:primary_category term="quant-ph" scheme="http://arxiv.org/schemas/atom" />
  </entry>
</feed>
XML, 200, ['Content-Type' => 'application/atom+xml']),
        ]);

        $response = $this->get(route('api.search', ['query' => 'quantum']));

        $response
            ->assertOk()
            ->assertInertia(fn(Assert $page) => $page
                ->component('Home')
                ->where('feed.totalResults', 1)
                ->where('feed.entries.0.id', 'http://arxiv.org/abs/1234.5678v1')
                ->where('feed.entries.0.title', 'Quantum Paper')
                ->where('feed.entries.0.summary', 'Important summary.')
                ->where('feed.entries.0.authors.0.name', 'Alice')
                ->where('feed.entries.0.authors.1.name', 'Bob')
                ->where('feed.entries.0.primaryCategory.term', 'quant-ph')
                ->where('feed.entries.0.categories.1.term', 'cs.AI')
                ->where('feed.entries.0.links.1.href', 'http://arxiv.org/pdf/1234.5678v1'));

        Http::assertSentCount(1);
    }
}
