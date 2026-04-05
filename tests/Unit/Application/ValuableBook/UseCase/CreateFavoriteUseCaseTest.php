<?php

namespace Tests\Unit\Application\ValuableBook\UseCase;

use App\Application\ValuableBook\Dto\CreateFavoriteInputData;
use App\Application\ValuableBook\UseCase\CreateFavoriteUseCase;
use App\Domain\ValuableBook\Entity\ValuableBookEntity;
use App\Domain\ValuableBook\Factory\ValuableBookFactory;
use App\Domain\ValuableBook\Repository\FavoriteRepository;
use App\Domain\ValuableBook\Repository\ValuableBookRepository;
use App\Domain\ValuableBook\ValueObject\SourcePaperId;
use App\Domain\ValuableBook\ValueObject\UserPublicUuid;
use App\Domain\ValuableBook\ValueObject\ValuableBookIdentity;
use App\Domain\ValuableBook\ValueObject\ValuableBookSource;
use App\Domain\ValuableBook\ValueObject\ValuableBookTitle;
use PHPUnit\Framework\TestCase;

class CreateFavoriteUseCaseTest extends TestCase
{
    public function test_it_persists_book_and_registers_favorite_by_identity(): void
    {
        $valuableBookRepository = new SpyValuableBookRepository();
        $favoriteRepository = new SpyFavoriteRepository();

        $useCase = new CreateFavoriteUseCase(
            new ValuableBookFactory(),
            $valuableBookRepository,
            $favoriteRepository,
        );

        $useCase->__invoke(new CreateFavoriteInputData(
            userPublicUuid: ' user-uuid ',
            source: ' arxiv ',
            sourcePaperId: ' paper-id ',
            title: ' Sample Title ',
            abstract: 'Summary',
            publishedAt: null,
            updatedAtSource: null,
            authors: [['name' => 'Alice']],
            categories: [['term' => 'cs.AI', 'scheme' => null]],
            links: [],
            primaryCategory: 'cs.AI',
            rawPayload: ['id' => 'paper-id'],
        ));

        $this->assertNotNull($valuableBookRepository->savedBook);
        $this->assertSame('arxiv', $valuableBookRepository->savedBook->source()->value());
        $this->assertSame('paper-id', $valuableBookRepository->savedBook->sourcePaperId()->value());
        $this->assertSame('user-uuid', $favoriteRepository->storedUserPublicUuid?->value());
        $this->assertNotNull($favoriteRepository->storedIdentity);
        $this->assertTrue($favoriteRepository->storedIdentity->equals(
            new ValuableBookIdentity(
                ValuableBookSource::fromString('arxiv'),
                SourcePaperId::fromString('paper-id'),
            ),
        ));
    }
}

class SpyValuableBookRepository implements ValuableBookRepository
{
    public ?ValuableBookEntity $savedBook = null;

    public function save(ValuableBookEntity $valuableBook): ValuableBookEntity
    {
        $this->savedBook = $valuableBook;

        return $valuableBook->withId(1);
    }
}

class SpyFavoriteRepository implements FavoriteRepository
{
    public ?UserPublicUuid $storedUserPublicUuid = null;

    public ?ValuableBookIdentity $storedIdentity = null;

    public function store(UserPublicUuid $userPublicUuid, ValuableBookIdentity $valuableBookIdentity): void
    {
        $this->storedUserPublicUuid = $userPublicUuid;
        $this->storedIdentity = $valuableBookIdentity;
    }
}
