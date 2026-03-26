<?php

declare(strict_types=1);

namespace App\Infrastructure\ValuableBook;

use App\Domain\ValuableBook\Entity\ValuableBookEntity;
use App\Domain\ValuableBook\Repository\FavoriteRepository;
use App\Domain\ValuableBook\ValueObject\UserPublicUuid;
use App\Models\User\User;
use App\Models\UserValuableBookFavorite;

class DbFavoriteRepository implements FavoriteRepository
{
    public function store(UserPublicUuid $userPublicUuid, ValuableBookEntity $valuableBook): void
    {
        $valuableBookId = $valuableBook->id();

        if ($valuableBookId === null) {
            return;
        }

        $user = User::query()->where('public_uuid', $userPublicUuid->value())->firstOrFail();

        UserValuableBookFavorite::query()->firstOrCreate([
            'user_id' => $user->id,
            'valuable_book_id' => $valuableBookId,
        ]);
    }
}
