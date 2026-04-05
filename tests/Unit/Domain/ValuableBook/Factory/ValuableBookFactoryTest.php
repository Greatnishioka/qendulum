<?php

namespace Tests\Unit\Domain\ValuableBook\Factory;

use App\Domain\ValuableBook\Factory\ValuableBookFactory;
use PHPUnit\Framework\TestCase;

class ValuableBookFactoryTest extends TestCase
{
    public function test_it_creates_valuable_book_with_normalized_payload(): void
    {
        $factory = new ValuableBookFactory();

        $valuableBook = $factory->create(
            source: ' arxiv ',
            sourcePaperId: ' http://arxiv.org/abs/1234.5678v1 ',
            title: '  Quantum Paper  ',
            abstract: 'Important summary.',
            publishedAt: '2026-03-21T00:00:00Z',
            updatedAtSource: '2026-03-22T00:00:00Z',
            authors: [
                ['name' => ' Alice '],
                ['name' => 'Bob'],
            ],
            categories: [
                ['term' => ' quant-ph ', 'scheme' => 'http://arxiv.org/schemas/atom'],
                ['term' => 'cs.AI', 'scheme' => 'http://arxiv.org/schemas/atom'],
            ],
            links: [
                [
                    'href' => 'http://arxiv.org/abs/1234.5678v1',
                    'rel' => 'alternate',
                    'type' => 'text/html',
                    'title' => null,
                ],
                [
                    'href' => ' http://arxiv.org/pdf/1234.5678v1 ',
                    'rel' => 'related',
                    'type' => 'application/pdf',
                    'title' => null,
                ],
            ],
            primaryCategory: 'quant-ph',
            rawPayload: ['id' => 'http://arxiv.org/abs/1234.5678v1'],
        );

        $this->assertSame('arxiv', $valuableBook->source()->value());
        $this->assertSame('http://arxiv.org/abs/1234.5678v1', $valuableBook->sourcePaperId()->value());
        $this->assertSame('Quantum Paper', $valuableBook->title()->value());
        $this->assertSame('http://arxiv.org/pdf/1234.5678v1', $valuableBook->pdfUrl());
        $this->assertSame('http://arxiv.org/abs/1234.5678v1', $valuableBook->absUrl());
        $this->assertSame(['quant-ph', 'cs.AI'], $valuableBook->categories());
        $this->assertSame(['Alice', 'Bob'], $valuableBook->authors());
    }

    public function test_it_falls_back_to_source_paper_id_when_abs_link_is_missing(): void
    {
        $factory = new ValuableBookFactory();

        $valuableBook = $factory->create(
            source: 'arxiv',
            sourcePaperId: 'http://arxiv.org/abs/9999.0001v1',
            title: 'Fallback Paper',
            abstract: null,
            publishedAt: null,
            updatedAtSource: null,
            authors: [],
            categories: [],
            links: [],
            primaryCategory: null,
            rawPayload: [],
        );

        $this->assertSame('http://arxiv.org/abs/9999.0001v1', $valuableBook->absUrl());
        $this->assertNull($valuableBook->pdfUrl());
    }
}
