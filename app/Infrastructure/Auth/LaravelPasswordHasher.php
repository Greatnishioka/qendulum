<?php

namespace App\Infrastructure\Auth;

use App\Domain\Auth\Service\PasswordHasher;
use Illuminate\Support\Facades\Hash;

class LaravelPasswordHasher implements PasswordHasher
{
    public function check(string $plain, string $hashed): bool
    {
        return Hash::check($plain, $hashed);
    }
}
