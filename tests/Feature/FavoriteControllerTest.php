<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class FavoriteControllerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * 仕様:
     * お気に入り登録時は、arXiv 論文ペイロードから valuable_book を生成し、
     * 対象ユーザーとのお気に入り関連も同時に保存する。
     */
    public function test_it_creates_favorite_and_valuable_book_from_payload(): void
    {
        $publicUuid = (string) Str::uuid();
        $userId = DB::table('users')->insertGetId([
            'public_uuid' => $publicUuid,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $payload = [
            'user_id' => $publicUuid,
            'valuable_book' => [
                'id' => 'http://arxiv.org/abs/1234.5678v1',
                'title' => '  Quantum Paper  ',
                'summary' => 'Important summary.',
                'published' => '2026-03-21T00:00:00Z',
                'updated' => '2026-03-22T00:00:00Z',
                'authors' => [
                    ['name' => 'Alice'],
                    ['name' => 'Bob'],
                ],
                'links' => [
                    [
                        'href' => 'http://arxiv.org/abs/1234.5678v1',
                        'rel' => 'alternate',
                        'type' => 'text/html',
                    ],
                    [
                        'href' => 'http://arxiv.org/pdf/1234.5678v1',
                        'rel' => 'related',
                        'type' => 'application/pdf',
                    ],
                ],
                'categories' => [
                    ['term' => 'quant-ph', 'scheme' => 'http://arxiv.org/schemas/atom'],
                    ['term' => 'cs.AI', 'scheme' => 'http://arxiv.org/schemas/atom'],
                ],
                'primaryCategory' => [
                    'term' => 'quant-ph',
                    'scheme' => 'http://arxiv.org/schemas/atom',
                ],
            ],
        ];

        $response = $this
            ->from('/search')
            ->post(route('favorites.store'), $payload);

        $response->assertRedirect('/search');

        $this->assertDatabaseHas('valuable_book', [
            'source' => 'arxiv',
            'source_paper_id' => 'http://arxiv.org/abs/1234.5678v1',
            'title' => 'Quantum Paper',
            'pdf_url' => 'http://arxiv.org/pdf/1234.5678v1',
            'abs_url' => 'http://arxiv.org/abs/1234.5678v1',
            'primary_category' => 'quant-ph',
        ]);

        $valuableBook = DB::table('valuable_book')->first();

        $this->assertSame(['quant-ph', 'cs.AI'], json_decode($valuableBook->categories, true));
        $this->assertSame(['Alice', 'Bob'], json_decode($valuableBook->authors, true));
        $this->assertSame('http://arxiv.org/abs/1234.5678v1', json_decode($valuableBook->raw_payload, true)['id']);

        $this->assertDatabaseHas('user_valuable_book_favorite', [
            'user_id' => $userId,
            'valuable_book_id' => $valuableBook->id,
        ]);
    }

    /**
     * 仕様:
     * 同一ユーザーが同一論文を繰り返しお気に入り登録しても、
     * 論文レコードとお気に入り関連は重複作成されない。
     */
    public function test_it_does_not_duplicate_book_or_favorite_for_same_payload(): void
    {
        $publicUuid = (string) Str::uuid();

        DB::table('users')->insert([
            'public_uuid' => $publicUuid,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $payload = [
            'user_id' => $publicUuid,
            'valuable_book' => [
                'id' => 'http://arxiv.org/abs/9999.0001v1',
                'title' => 'Duplicate-safe Paper',
            ],
        ];

        $this->from('/search')->post(route('favorites.store'), $payload)->assertRedirect('/search');
        $this->from('/search')->post(route('favorites.store'), $payload)->assertRedirect('/search');

        $this->assertDatabaseCount('valuable_book', 1);
        $this->assertDatabaseCount('user_valuable_book_favorite', 1);
    }
}
