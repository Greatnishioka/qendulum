<?php

declare(strict_types=1);

namespace App\Domain\ValuableBook\Repository;

use App\Domain\ValuableBook\ValueObject\UserPublicUuid;
use App\Domain\ValuableBook\ValueObject\ValuableBookIdentity;

interface FavoriteRepository
{
    public function store(UserPublicUuid $userPublicUuid, ValuableBookIdentity $valuableBookIdentity): void;
}
