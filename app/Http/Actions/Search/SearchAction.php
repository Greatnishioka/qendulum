<?php

namespace App\Http\Actions\Search;

use App\Application\Search\UseCase\SearchPaperUseCase;
use App\Http\Requests\Search\SearchRequest;
use App\Http\Responders\Search\SearchResponder;
use Inertia\Response;

class SearchAction
{
    public function __construct(
        private readonly SearchPaperUseCase $searchPaperUseCase,
        private readonly SearchResponder $searchResponder,
    ) {
    }

    public function __invoke(SearchRequest $request): Response
    {
        $feed = $this->searchPaperUseCase->__invoke($request->toInputData());

        return $this->searchResponder->success($feed);
    }
}
