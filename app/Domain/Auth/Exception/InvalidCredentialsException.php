<?php

namespace App\Domain\Auth\Exception;

use RuntimeException;

class InvalidCredentialsException extends RuntimeException
{
    public function __construct(
        string $message,
        public readonly ?string $errorCode = null,
        int $code = 0,
        ?\Throwable $previous = null
    ) {
        parent::__construct($message, $code, $previous);
    }
}
