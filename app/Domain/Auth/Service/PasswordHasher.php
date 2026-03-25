<?php

namespace App\Domain\Auth\Service;

interface PasswordHasher
{
    public function check(string $plain, string $hashed): bool;
}
