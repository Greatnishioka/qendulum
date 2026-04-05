<?php

declare(strict_types=1);

namespace App\Infrastructure\ValuableBook;

use App\Domain\ValuableBook\Repository\FavoriteRepository;
use App\Domain\ValuableBook\ValueObject\UserPublicUuid;
use App\Domain\ValuableBook\ValueObject\ValuableBookIdentity;
use App\Models\User\User;
use App\Models\ValuableBook\ValuableBook;
use App\Models\UserValuableBookFavorite;

class DbFavoriteRepository implements FavoriteRepository
{
    public function store(UserPublicUuid $userPublicUuid, ValuableBookIdentity $valuableBookIdentity): void
    {
        $user = User::query()->where('public_uuid', $userPublicUuid->value())->firstOrFail();
        $valuableBook = ValuableBook::query()
            ->where('source', $valuableBookIdentity->source()->value())
            ->where('source_paper_id', $valuableBookIdentity->sourcePaperId()->value())
            ->firstOrFail();

        UserValuableBookFavorite::query()->firstOrCreate([
            'user_id' => $user->id,
            'valuable_book_id' => $valuableBook->id,
        ]);
    }
}
