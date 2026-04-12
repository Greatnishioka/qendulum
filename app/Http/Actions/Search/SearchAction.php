<?php

namespace App\Http\Actions\Search;

use App\Application\Search\UseCase\SearchPaperUseCase;
use App\Http\Requests\Search\SearchRequest;
use App\Http\Responders\Search\SearchResponder;
use Inertia\Response;
use OpenApi\Attributes as OA;

class SearchAction
{
    public function __construct(
        private readonly SearchPaperUseCase $searchPaperUseCase,
        private readonly SearchResponder $searchResponder,
    ) {
    }

    #[OA\Get(
        path: '/search',
        operationId: 'searchPapers',
        summary: 'Render the search page with query results',
        tags: ['Search'],
        parameters: [
            new OA\QueryParameter(
                name: 'query',
                required: false,
                description: 'Search query string.',
                schema: new OA\Schema(type: 'string', maxLength: 255)
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Search page rendered successfully.',
                content: new OA\MediaType(mediaType: 'text/html')
            ),
            new OA\Response(
                response: 422,
                description: 'Validation failed.',
                content: new OA\JsonContent(ref: '#/components/schemas/ValidationErrorResponse')
            ),
        ]
    )]
    public function __invoke(SearchRequest $request): Response
    {
        $feed = $this->searchPaperUseCase->__invoke($request->toInputData());

        return $this->searchResponder->success($feed);
    }
}
