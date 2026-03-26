<?php

namespace App\Application\Auth\Dto;

use App\Domain\Auth\ValueObject\Email;
use App\Domain\Auth\ValueObject\Password;

class LoginInputData
{
    public function __construct(
        public readonly Email $email,
        public readonly Password $password,
    ) {
    }
}
