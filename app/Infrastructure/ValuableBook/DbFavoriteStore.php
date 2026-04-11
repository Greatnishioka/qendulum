<?php

declare(strict_types=1);

namespace App\Infrastructure\ValuableBook;

use App\Application\ValuableBook\Port\FavoriteStore;
use App\Domain\User\ValueObject\UserId;
use App\Domain\ValuableBook\ValueObject\ValuableBookIdentity;
use App\Models\UserValuableBookFavorite;
use App\Models\ValuableBook\ValuableBook;
use RuntimeException;

class DbFavoriteStore implements FavoriteStore
{
    public function store(UserId $userId, ValuableBookIdentity $valuableBookIdentity): void
    {
        $valuableBookId = ValuableBook::query()
            ->where('source', $valuableBookIdentity->source()->value())
            ->where('source_paper_id', $valuableBookIdentity->sourcePaperId()->value())
            ->value('id');

        if (! is_int($valuableBookId)) {
            throw new RuntimeException('Valuable book not found.');
        }

        UserValuableBookFavorite::query()->firstOrCreate([
            'user_id' => $userId->value(),
            'valuable_book_id' => $valuableBookId,
        ]);
    }
}
