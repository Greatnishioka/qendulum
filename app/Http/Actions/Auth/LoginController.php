<?php

namespace App\Http\Controllers\Auth;

use App\Application\Auth\UseCase\LoginUseCase;
use App\Domain\Auth\Exception\InvalidCredentialsException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\Auth\LoginResource;
use App\Http\Responders\Auth\LoginResponder;
use Illuminate\Http\RedirectResponse;

class LoginController
{
    public function __construct(
        private readonly LoginUseCase $loginUseCase,
        private readonly LoginResponder $loginResponder,
    ) {
    }

    /**
     * Handle the incoming request.
     */
    public function __invoke(LoginRequest $request): RedirectResponse
    {
        try {
            $userAuth = $this->loginUseCase->__invoke($request->toInputData());
        } catch (InvalidCredentialsException) {
            $this->loginResponder->invalidCredentials();
        }

        return $this->loginResponder->success($request, new LoginResource($userAuth));
    }
}
