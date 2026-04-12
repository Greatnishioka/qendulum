<?php

declare(strict_types=1);

namespace App\OpenApi;

use OpenApi\Attributes as OA;

#[OA\OpenApi(openapi: '3.1.0')]
#[OA\Info(
    version: '0.1.0',
    title: 'Qendulum API',
    description: 'OpenAPI specification for the Qendulum web endpoints.'
)]
#[OA\Server(
    url: 'http://localhost:8000',
    description: 'Local development server'
)]
#[OA\Tag(name: 'Search', description: 'Search endpoints')]
#[OA\Tag(name: 'Auth', description: 'Authentication endpoints')]
#[OA\Tag(name: 'Favorites', description: 'Favorite management endpoints')]
#[OA\Schema(
    schema: 'ValidationErrorResponse',
    type: 'object',
    required: ['message', 'errors'],
    properties: [
        new OA\Property(property: 'message', type: 'string', example: 'The given data was invalid.'),
        new OA\Property(
            property: 'errors',
            type: 'object',
            additionalProperties: new OA\AdditionalProperties(
                type: 'array',
                items: new OA\Items(type: 'string')
            )
        ),
    ]
)]
#[OA\Schema(
    schema: 'FavoriteAuthor',
    type: 'object',
    required: ['name'],
    properties: [
        new OA\Property(property: 'name', type: 'string', maxLength: 255, example: 'Jane Doe'),
    ]
)]
#[OA\Schema(
    schema: 'FavoriteLink',
    type: 'object',
    required: ['href'],
    properties: [
        new OA\Property(property: 'href', type: 'string', maxLength: 2048, example: 'https://arxiv.org/abs/1234.5678'),
        new OA\Property(property: 'rel', type: 'string', nullable: true, maxLength: 255, example: 'alternate'),
        new OA\Property(property: 'type', type: 'string', nullable: true, maxLength: 255, example: 'text/html'),
        new OA\Property(property: 'title', type: 'string', nullable: true, maxLength: 255, example: 'Abstract page'),
    ]
)]
#[OA\Schema(
    schema: 'FavoriteCategory',
    type: 'object',
    required: ['term'],
    properties: [
        new OA\Property(property: 'term', type: 'string', maxLength: 255, example: 'cs.AI'),
        new OA\Property(property: 'scheme', type: 'string', nullable: true, maxLength: 255, example: 'http://arxiv.org/schemas/atom'),
    ]
)]
#[OA\Schema(
    schema: 'FavoritePrimaryCategory',
    type: 'object',
    properties: [
        new OA\Property(property: 'term', type: 'string', nullable: true, maxLength: 255, example: 'cs.AI'),
        new OA\Property(property: 'scheme', type: 'string', nullable: true, maxLength: 255, example: 'http://arxiv.org/schemas/atom'),
    ]
)]
#[OA\Schema(
    schema: 'FavoriteValuableBook',
    type: 'object',
    required: ['id', 'title'],
    properties: [
        new OA\Property(property: 'id', type: 'string', maxLength: 255, example: 'http://arxiv.org/abs/1234.5678'),
        new OA\Property(property: 'title', type: 'string', maxLength: 255, example: 'Example paper title'),
        new OA\Property(property: 'summary', type: 'string', nullable: true),
        new OA\Property(property: 'published', type: 'string', format: 'date-time', nullable: true),
        new OA\Property(property: 'updated', type: 'string', format: 'date-time', nullable: true),
        new OA\Property(property: 'authors', type: 'array', nullable: true, items: new OA\Items(ref: '#/components/schemas/FavoriteAuthor')),
        new OA\Property(property: 'links', type: 'array', nullable: true, items: new OA\Items(ref: '#/components/schemas/FavoriteLink')),
        new OA\Property(property: 'categories', type: 'array', nullable: true, items: new OA\Items(ref: '#/components/schemas/FavoriteCategory')),
        new OA\Property(property: 'primaryCategory', ref: '#/components/schemas/FavoritePrimaryCategory', nullable: true),
        new OA\Property(property: 'comment', type: 'string', nullable: true),
        new OA\Property(property: 'journalRef', type: 'string', nullable: true, maxLength: 255),
        new OA\Property(property: 'doi', type: 'string', nullable: true, maxLength: 255),
    ]
)]
#[OA\Schema(
    schema: 'CreateFavoriteRequestBody',
    type: 'object',
    required: ['user_id', 'valuable_book'],
    properties: [
        new OA\Property(property: 'user_id', type: 'string', maxLength: 255, example: 'e4d2f0a6-92df-4c5d-9df8-5b5b71f30abc'),
        new OA\Property(property: 'valuable_book', ref: '#/components/schemas/FavoriteValuableBook'),
    ]
)]
final class OpenApiSpec
{
}
