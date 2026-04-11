<?php

namespace App\Http\Actions\Auth;

use App\Application\Auth\UseCase\LoginUseCase;
use App\Domain\Auth\Exception\InvalidCredentialsException;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Responders\Auth\LoginResponder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;

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
            $authenticatedUser = $this->loginUseCase->__invoke($request->toInputData());
        } catch (InvalidCredentialsException) {
            throw ValidationException::withMessages([
                'email' => 'メールアドレスまたはパスワードが正しくありません。',
            ]);
        }

        return $this->loginResponder->success($request, $authenticatedUser);
    }
}
