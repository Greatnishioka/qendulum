<?php

declare(strict_types=1);

namespace App\Application\Auth\Dto;

final class AuthenticatedUser
{
    public function __construct(
        public readonly int $authId,
    ) {
    }
}
