<?php

declare(strict_types=1);

namespace App\Application\ValuableBook\Port;

use App\Domain\User\ValueObject\UserId;
use App\Domain\ValuableBook\ValueObject\ValuableBookIdentity;

interface FavoriteStore
{
    public function store(UserId $userId, ValuableBookIdentity $valuableBookIdentity): void;
}
