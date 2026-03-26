<?php

declare(strict_types=1);

namespace App\Domain\ValuableBook\Repository;

use App\Domain\ValuableBook\Entity\ValuableBookEntity;
use App\Domain\ValuableBook\ValueObject\UserPublicUuid;

interface FavoriteRepository
{
    public function store(UserPublicUuid $userPublicUuid, ValuableBookEntity $valuableBook): void;
}
