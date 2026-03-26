<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Application\ValuableBook\UseCase\CreateFavoriteUseCase;
use App\Http\Requests\ValuableBook\CreateFavoriteRequest;
use App\Http\Responders\ValuableBook\CreateFavoriteResponder;
use Illuminate\Http\RedirectResponse;

class FavoriteController
{
    public function __construct(
        private readonly CreateFavoriteUseCase $createFavoriteUseCase,
        private readonly CreateFavoriteResponder $createFavoriteResponder,
    ) {
    }

    public function __invoke(CreateFavoriteRequest $request): RedirectResponse
    {
        $this->createFavoriteUseCase->__invoke($request->toInputData());

        return $this->createFavoriteResponder->success();
    }
}
