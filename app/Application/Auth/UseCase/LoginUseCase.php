<?php

namespace App\Application\Auth\UseCase;

use App\Application\Auth\Dto\LoginInputData;
use App\Domain\Auth\Entity\UserAuthEntity;
use App\Domain\Auth\Exception\InvalidCredentialsException;
use App\Domain\Auth\Repository\UserAuthRepository;
use App\Domain\Auth\Service\UserAuthenticator;

class LoginUseCase
{
    public function __construct(
        private readonly UserAuthRepository $userAuthRepository,
        private readonly UserAuthenticator $userAuthenticator,
    ) {
    }

    public function __invoke(LoginInputData $input): UserAuthEntity
    {
        $userAuth = $this->userAuthRepository->findByEmail($input->email);

        if ($userAuth === null || ! $this->userAuthenticator->canAuthenticate($userAuth, $input->password->value())) {
            throw new InvalidCredentialsException('Invalid login credentials.');
        }

        return $userAuth;
    }
}
