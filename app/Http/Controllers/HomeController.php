<?php

namespace App\Http\Controllers;

use App\Application\ValuableBook\UseCase\SearchArxivUseCase;
use App\Http\Requests\ValuableBook\SearchArxivRequest;
use App\Http\Responders\ValuableBook\SearchArxivResponder;
use Inertia\Response;

class HomeController extends Controller
{
    public function __construct(
        private readonly SearchArxivUseCase $searchArxivUseCase,
        private readonly SearchArxivResponder $searchArxivResponder,
    ) {
    }

    public function __invoke(SearchArxivRequest $request): Response
    {
        $feed = $this->searchArxivUseCase->__invoke($request->toInputData());

        return $this->searchArxivResponder->success($feed);
    }
}
