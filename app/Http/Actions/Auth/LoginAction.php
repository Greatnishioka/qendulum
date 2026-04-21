<?php

namespace App\Http\Actions\Auth;

use App\Application\Auth\UseCase\LoginUseCase;
use App\Domain\Auth\Exception\InvalidCredentialsException;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Responders\Auth\LoginResponder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;
use OpenApi\Attributes as OA;

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
    #[OA\Post(
        path: '/login',
        operationId: 'login',
        summary: 'Authenticate a user and redirect back',
        tags: ['Auth'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['email', 'password'],
                properties: [
                    new OA\Property(property: 'email', type: 'string', format: 'email', example: 'user@example.com'),
                    new OA\Property(property: 'password', type: 'string', minLength: 8, maxLength: 128, example: 'Example!234'),
                    new OA\Property(property: 'remember', type: 'boolean', nullable: true, example: false),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 302,
                description: 'Authenticated successfully and redirected back.',
                headers: [
                    new OA\Header(
                        header: 'Location',
                        description: 'Redirect target.',
                        schema: new OA\Schema(type: 'string')
                    ),
                ]
            ),
            new OA\Response(
                response: 422,
                description: 'Validation failed or credentials were invalid.',
                content: new OA\JsonContent(ref: '#/components/schemas/ValidationErrorResponse')
            ),
        ]
    )]
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
