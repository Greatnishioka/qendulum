<?php

declare(strict_types=1);

namespace App\Infrastructure\User;

use App\Application\ValuableBook\Port\UserIdResolver;
use App\Domain\User\Exception\UserNotFoundException;
use App\Domain\User\ValueObject\UserId;
use App\Domain\User\ValueObject\UserPublicUuid;
use App\Models\User\User;

class DbUserIdResolver implements UserIdResolver
{
    public function resolve(UserPublicUuid $userPublicUuid): UserId
    {
        $userId = User::query()
            ->where('public_uuid', $userPublicUuid->value())
            ->value('id');

        if (! is_int($userId)) {
            throw new UserNotFoundException('User not found.');
        }

        return UserId::fromInt($userId);
    }
}
