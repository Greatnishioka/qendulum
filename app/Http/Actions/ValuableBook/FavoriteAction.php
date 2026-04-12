<?php

declare(strict_types=1);

namespace App\Http\Actions\ValuableBook;

use App\Application\ValuableBook\UseCase\CreateFavoriteUseCase;
use App\Http\Requests\ValuableBook\CreateFavoriteRequest;
use App\Http\Responders\ValuableBook\CreateFavoriteResponder;
use Illuminate\Http\RedirectResponse;
use OpenApi\Attributes as OA;

class FavoriteAction
{
    public function __construct(
        private readonly CreateFavoriteUseCase $createFavoriteUseCase,
        private readonly CreateFavoriteResponder $createFavoriteResponder,
    ) {
    }

    #[OA\Post(
        path: '/favorites',
        operationId: 'createFavorite',
        summary: 'Create a favorite entry and redirect back',
        tags: ['Favorites'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: '#/components/schemas/CreateFavoriteRequestBody')
        ),
        responses: [
            new OA\Response(
                response: 302,
                description: 'Favorite was accepted and the client was redirected back.',
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
                description: 'Validation failed.',
                content: new OA\JsonContent(ref: '#/components/schemas/ValidationErrorResponse')
            ),
        ]
    )]
    public function __invoke(CreateFavoriteRequest $request): RedirectResponse
    {
        $this->createFavoriteUseCase->__invoke($request->toInputData());

        return $this->createFavoriteResponder->success();
    }
}
