<?php

namespace App\Application\Auth\Dto;

class LoginInputData
{
    public function __construct(
        public readonly string $email,
        public readonly string $password,
    ) {
    }
}
