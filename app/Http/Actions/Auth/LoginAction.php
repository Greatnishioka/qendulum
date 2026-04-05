<?php

namespace App\Http\Actions\Auth;

use App\Application\Auth\UseCase\LoginUseCase;
use App\Domain\Auth\Exception\InvalidCredentialsException;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\Auth\LoginResource;
use App\Http\Responders\Auth\LoginResponder;
use Illuminate\Http\RedirectResponse;

class LoginAction
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
            throw new InvalidCredentialsException('Invalid email or password.', 'invalid_credentials', 401);
        }
        return $this->loginResponder->success($request, new LoginResource($userAuth));
    }
}
