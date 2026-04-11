<?php

declare(strict_types=1);

namespace App\Application\ValuableBook\Port;

use App\Domain\User\ValueObject\UserId;
use App\Domain\User\ValueObject\UserPublicUuid;

interface UserIdResolver
{
    public function resolve(UserPublicUuid $userPublicUuid): UserId;
}
