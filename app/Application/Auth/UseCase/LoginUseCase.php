<?php

namespace App\Application\Auth\UseCase;

use App\Application\Auth\Dto\LoginInputData;
use App\Domain\Auth\Entity\UserAuthEntity;
use App\Domain\Auth\Exception\InvalidCredentialsException;
use App\Domain\Auth\Repository\UserAuthRepository;
use App\Domain\Auth\Service\PasswordHasher;

class LoginUseCase
{
    public function __construct(
        private readonly UserAuthRepository $userAuthRepository,
        private readonly PasswordHasher $passwordHasher,
    ) {
    }

    public function __invoke(LoginInputData $input): UserAuthEntity
    {
        $userAuth = $this->userAuthRepository->findByEmail($input->email);

        if ($userAuth === null || ! $this->passwordHasher->check($input->password, $userAuth->passwordHash())) {
            throw new InvalidCredentialsException('Invalid login credentials.');
        }

        return $userAuth;
    }
}
